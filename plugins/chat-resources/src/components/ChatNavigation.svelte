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
  import { createEventDispatcher } from 'svelte'
  import { NavigationList, NavigationSection } from '@hcengineering/ui-next'
  import { languageStore, Scroller } from '@hcengineering/ui'
  import { Ref } from '@hcengineering/core'
  import { NotificationContext } from '@hcengineering/communication-types'

  import { cardsToChatSections, NavigatorState, navigatorStateStore, toggleSection } from '../navigator'

  export let card: Card | undefined = undefined
  export let cards: Card[] = []
  export let contexts: NotificationContext[] = []

  const dispatch = createEventDispatcher()

  let sections: NavigationSection[] = []

  $: void updateSections(cards, contexts, $languageStore, $navigatorStateStore)
  async function updateSections (
    cards: Card[],
    contexts: NotificationContext[],
    _lang: string,
    state: NavigatorState
  ): Promise<void> {
    sections = await cardsToChatSections(cards, contexts, state)
  }

  function handleSectionToggle (event: CustomEvent<string>): void {
    toggleSection(event.detail)
  }

  function handleClick (event: CustomEvent<Ref<Card>>): void {
    const cardId = event.detail

    if (card != null && cardId === card._id) {
      return
    }

    const newCard = cards.find((it) => it._id === cardId)

    if (newCard !== undefined) {
      dispatch('select', newCard)
    }
  }
</script>

<Scroller shrink>
  <div class="chat-navigation">
    <NavigationList {sections} selected={card?._id} on:toggle={handleSectionToggle} on:click={handleClick} />
  </div>
</Scroller>

<style lang="scss">
  .chat-navigation {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 8px;
    margin-top: 3rem;
  }
</style>
