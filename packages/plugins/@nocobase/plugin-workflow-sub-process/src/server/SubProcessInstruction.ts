/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import WorkflowPlugin, {
  Processor,
  JOB_STATUS,
  EXECUTION_STATUS,
  Instruction,
  FlowNodeModel,
  JobModel,
} from '@nocobase/plugin-workflow';

export interface SubProcessConfig {
  /** Key of the target workflow to invoke */
  workflowKey: string;
  /** Sync (wait for result) or async (fire-and-forget) */
  mode: 'sync' | 'async';
  /** Variable mapping: parent context → child context */
  inputMapping?: Record<string, any>;
  /** Variable mapping: child result → parent job result */
  outputMapping?: Record<string, string>;
  /** Timeout in seconds (for sync mode) */
  timeout?: number;
}

/**
 * Sub-process instruction: invokes another workflow as a child process.
 *
 * In sync mode, the parent workflow waits for the child to complete.
 * In async mode, the parent continues immediately after triggering the child.
 */
export default class SubProcessInstruction extends Instruction {
  constructor(public workflow: WorkflowPlugin) {
    super(workflow);
  }

  async run(node: FlowNodeModel, prevJob: JobModel, processor: Processor) {
    const config = node.config as SubProcessConfig;
    const { workflowKey, mode = 'sync', inputMapping = {} } = config;

    // Resolve the target workflow from the cache
    const targetWorkflow = Array.from(this.workflow.enabledCache.values()).find(
      (w) => w.key === workflowKey && w.enabled && w.current,
    );

    if (!targetWorkflow) {
      processor.logger.error(
        `Sub-process: target workflow "${workflowKey}" not found or not enabled`,
      );
      return processor.saveJob({
        status: JOB_STATUS.ERROR,
        result: { error: `Target workflow "${workflowKey}" not found or not enabled` },
        nodeId: node.id,
        nodeKey: node.key,
        upstreamId: prevJob?.id ?? null,
      });
    }

    // Build the child context by resolving input mappings
    const childContext: Record<string, any> = {};
    for (const [childKey, parentExpression] of Object.entries(inputMapping)) {
      childContext[childKey] = processor.getParsedValue(parentExpression, node.id);
    }

    if (mode === 'async') {
      // Fire-and-forget: trigger the child workflow and continue
      this.workflow.trigger(targetWorkflow, { data: childContext });

      return processor.saveJob({
        status: JOB_STATUS.RESOLVED,
        result: { mode: 'async', targetWorkflowKey: workflowKey },
        nodeId: node.id,
        nodeKey: node.key,
        upstreamId: prevJob?.id ?? null,
      });
    }

    // Sync mode: trigger the child workflow and wait for it
    const job = processor.saveJob({
      status: JOB_STATUS.PENDING,
      result: { mode: 'sync', targetWorkflowKey: workflowKey },
      nodeId: node.id,
      nodeKey: node.key,
      upstreamId: prevJob?.id ?? null,
    });

    // Trigger the child workflow synchronously
    const childProcessor = await this.workflow.trigger(targetWorkflow, {
      data: childContext,
      parentJobId: job.id,
    });

    if (!childProcessor) {
      job.set({
        status: JOB_STATUS.ERROR,
        result: { error: 'Failed to trigger sub-process' },
      });
      return job;
    }

    // Check if the child completed immediately
    const { execution } = childProcessor;
    if (execution.status === EXECUTION_STATUS.RESOLVED) {
      const outputResult = this.mapOutput(
        childProcessor.lastSavedJob?.result,
        config.outputMapping,
      );
      job.set({
        status: JOB_STATUS.RESOLVED,
        result: { ...job.result, output: outputResult },
      });
      return job;
    }

    if (execution.status < EXECUTION_STATUS.STARTED) {
      job.set({
        status: JOB_STATUS.FAILED,
        result: { ...job.result, error: 'Sub-process failed', childStatus: execution.status },
      });
      return job;
    }

    // Still running (e.g., manual nodes in child workflow) - stay pending
    return job;
  }

  async resume(node: FlowNodeModel, job: JobModel, processor: Processor) {
    // Called when the child workflow completes asynchronously
    const config = node.config as SubProcessConfig;
    const outputResult = this.mapOutput(job.result?.childResult, config.outputMapping);

    job.set({
      status: job.result?.childStatus === EXECUTION_STATUS.RESOLVED
        ? JOB_STATUS.RESOLVED
        : JOB_STATUS.FAILED,
      result: { ...job.result, output: outputResult },
    });

    return job;
  }

  /**
   * Map child workflow output to the expected structure.
   */
  private mapOutput(
    childResult: any,
    outputMapping?: Record<string, string>,
  ): Record<string, any> {
    if (!outputMapping || !childResult) return childResult || {};

    const result: Record<string, any> = {};
    for (const [parentKey, childPath] of Object.entries(outputMapping)) {
      result[parentKey] = this.getNestedValue(childResult, childPath);
    }
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
