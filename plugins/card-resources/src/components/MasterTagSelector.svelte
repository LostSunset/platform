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
  import { Card } from '@hcengineering/card'
  import { getClient } from '@hcengineering/presentation'
  import { Label } from '@hcengineering/ui'

  export let value: Card

  $: selected = value._class

  const client = getClient()
  const hierarchy = client.getHierarchy()

  $: label = hierarchy.getClass(selected).label
</script>

<div class="flex flex-gap-2 items-center item caption-color">
  <div class="tag">
    <Label {label} />
  </div>
</div>

<style lang="scss">
  .tag {
    padding: 0.25rem 0.5rem 0.25rem 0.5rem;
    height: 1.5rem;
    border: 1px solid var(--theme-content-color);

    border-radius: 6rem;

    color: var(--theme-caption-color);

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    white-space: nowrap;
  }
</style>
