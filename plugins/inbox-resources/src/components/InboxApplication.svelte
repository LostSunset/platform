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
  import cardPlugin, { Card } from '@hcengineering/card'
  import {
    defineSeparators,
    Separator,
    deviceOptionsStore as deviceInfo,
    resolvedLocationStore,
    Location,
    restoreLocation,
    Component,
    Label,
    ModernButton,
    IconDelete,
    closePanel,
    getCurrentLocation
  } from '@hcengineering/ui'
  import { onDestroy } from 'svelte'
  import { getClient, getCommunicationClient } from '@hcengineering/presentation'
  import { inboxId } from '@hcengineering/inbox'
  import view from '@hcengineering/view'
  import { NotificationContext } from '@hcengineering/communication-types'
  import { SortingOrder } from '@hcengineering/core'

  import InboxNavigation from './InboxNavigation.svelte'
  import { getCardIdFromLocation, navigateToCard } from '../location'
  import inbox from '../plugin'

  const client = getClient()
  const communicationClient = getCommunicationClient()

  let replacedPanelElement: HTMLElement
  let card: Card | undefined = undefined
  let needRestoreLoc = true

  async function syncLocation (loc: Location): Promise<void> {
    if (loc.path[2] !== inboxId) {
      return
    }

    const cardId = getCardIdFromLocation(loc)

    if (cardId == null || cardId === '') {
      card = undefined
      if (needRestoreLoc) {
        needRestoreLoc = false
        restoreLocation(loc, inboxId)
      }
      return
    }

    needRestoreLoc = false

    if (cardId !== card?._id) {
      card = await client.findOne(cardPlugin.class.Card, { _id: cardId })
    }
  }

  function selectCard (event: CustomEvent<{ context: NotificationContext, card: Card }>): void {
    closePanel()
    const loc = getCurrentLocation()
    if (card?._id === event.detail.card._id && loc.path[2] === inboxId) return
    card = event.detail.card
    navigateToCard(card._id)
  }

  function handleClose (): void {
    navigateToCard(undefined)
  }

  onDestroy(
    resolvedLocationStore.subscribe((loc) => {
      void syncLocation(loc)
    })
  )

  defineSeparators('new-inbox', [
    { minSize: 15, maxSize: 60, size: 30, float: 'navigator' },
    { size: 'auto', minSize: 20, maxSize: 'auto' }
  ])

  $: $deviceInfo.replacedPanel = replacedPanelElement
  onDestroy(() => ($deviceInfo.replacedPanel = undefined))

  let clearing = false
  async function clearInbox (): Promise<void> {
    if (clearing) return
    try {
      clearing = true
      const contexts = await communicationClient.findNotificationContexts({ order: SortingOrder.Ascending })
      await Promise.all(contexts.map((context) => communicationClient.removeNotificationContext(context.id)))
      clearing = false
    } catch (e) {
      clearing = false
      console.error(e)
    }
  }
</script>

<div class="hulyPanels-container inbox">
  {#if $deviceInfo.navigator.visible}
    <div
      class="antiPanel-navigator {$deviceInfo.navigator.direction === 'horizontal'
        ? 'portrait'
        : 'landscape'} border-left inbox__navigator"
      class:fly={$deviceInfo.navigator.float}
    >
      <div class="antiPanel-wrap__content hulyNavPanel-container">
        <div class="hulyNavPanel-header withButton small inbox-header">
          <span class="overflow-label"><Label label={inbox.string.Inbox} /></span>
          <div class="flex-row-center flex-gap-2">
            <ModernButton
              label={inbox.string.ClearAll}
              icon={IconDelete}
              size="small"
              iconSize="small"
              on:click={clearInbox}
              loading={clearing}
            />
          </div>
        </div>
        <div class="antiPanel-wrap__content hulyNavPanel-container">
          <InboxNavigation {card} on:select={selectCard} />
        </div>
      </div>
      {#if !($deviceInfo.isMobile && $deviceInfo.isPortrait && $deviceInfo.minWidth)}
        <Separator name="new-inbox" float={$deviceInfo.navigator.float ? 'navigator' : true} index={0} />
      {/if}
    </div>
    <Separator
      name="new-inbox"
      float={$deviceInfo.navigator.float}
      index={0}
      color={'transparent'}
      separatorSize={0}
      short
    />
  {/if}
  <div bind:this={replacedPanelElement} class="hulyComponent inbox__panel">
    {#if card}
      {@const panel = client.getHierarchy().classHierarchyMixin(card._class, view.mixin.ObjectPanel)}
      <Component
        is={panel?.component ?? view.component.EditDoc}
        props={{
          _id: card._id,
          embedded: true
        }}
        on:close={handleClose}
      />
    {/if}
  </div>
</div>

<style lang="scss">
  .inbox {
    &__navigator {
      position: relative;
    }

    &__panel {
      position: relative;
    }
  }

  .inbox-header {
    border-bottom: 1px solid var(--theme-navpanel-border);
  }
</style>
