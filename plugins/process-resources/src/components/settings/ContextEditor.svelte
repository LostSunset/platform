<!--
// Copyright © 2025 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->

<script lang="ts">
  import { ContextId, Process, ProcessContext } from '@hcengineering/process'
  import { EditBox, Grid, Modal } from '@hcengineering/ui'
  import plugin from '../../plugin'
  import presentation, { getClient } from '@hcengineering/presentation'
  import { clearSettingsStore } from '@hcengineering/setting-resources'
  import core from '@hcengineering/core'
  import ProcessContextRawPresenter from '../contextEditors/ProcessContextRawPresenter.svelte'

  export let process: Process
  export let readonly: boolean

  const client = getClient()

  async function save () {
    await client.update(process, { context: process.context })
    clearSettingsStore()
  }

  function onNameChange (ev: Event, _id: string, ctx: ProcessContext) {
    const value = (ev.target as HTMLInputElement).value?.trim()
    ctx.name = value
    process.context[_id as ContextId] = ctx
  }
</script>

<Modal
  label={plugin.string.Data}
  type={'type-aside'}
  canSave={!readonly}
  okLabel={presentation.string.Save}
  okAction={save}
  showCancelButton={false}
  onCancel={clearSettingsStore}
>
  <div class="mt-2">
    <Grid>
      {#each Object.entries(process.context) as val}
        <div class="context flex-center">
          <ProcessContextRawPresenter context={val[1]} />
        </div>
        <EditBox
          kind={'ghost'}
          value={val[1].name ?? ''}
          placeholder={core.string.Name}
          disabled={readonly}
          on:change={(e) => {
            onNameChange(e, val[0], val[1])
          }}
        />
      {/each}
    </Grid>
  </div>
</Modal>

<style lang="scss">
  .context {
    justify-content: start;
    min-height: 2.5rem;
    border: 0.0625rem solid var(---primary-button-default);
    border-radius: 0.375rem;
    background: #3575de33;
    padding-left: 0.75rem;
    max-width: 100%;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--theme-caption-color);
  }
</style>
