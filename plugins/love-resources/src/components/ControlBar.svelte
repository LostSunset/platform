<!--
// Copyright © 2024 Hardcore Engineering Inc.
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
  import { getCurrentEmployee } from '@hcengineering/contact'
  import { AccountRole, getCurrentAccount, hasAccountRole } from '@hcengineering/core'
  import { Room, RoomType, isOffice, roomAccessIcon, RoomAccess } from '@hcengineering/love'
  import { getResource } from '@hcengineering/platform'
  import { getClient } from '@hcengineering/presentation'
  import {
    ButtonMenu,
    DropdownIntlItem,
    IconMaximize,
    IconMoreV,
    IconUpOutline,
    ModernButton,
    Popup,
    SplitButton,
    eventToHTMLElement,
    showPopup,
    type AnySvelteComponent,
    TooltipInstance
  } from '@hcengineering/ui'
  import view, { Action } from '@hcengineering/view'
  import { getActions } from '@hcengineering/view-resources'

  import love from '../plugin'
  import { currentRoom, myInfo, myOffice } from '../stores'
  import {
    isCamAllowed,
    isCameraEnabled,
    isConnected,
    isFullScreen,
    isMicAllowed,
    isMicEnabled,
    isRecording,
    isRecordingAvailable,
    isShareWithSound,
    isSharingEnabled,
    isTranscription,
    isTranscriptionAllowed,
    leaveRoom,
    record,
    screenSharing,
    setCam,
    setMic,
    setShare,
    startTranscription,
    stopTranscription
  } from '../utils'
  import CamSettingPopup from './CamSettingPopup.svelte'
  import ControlBarContainer from './ControlBarContainer.svelte'
  import MicSettingPopup from './MicSettingPopup.svelte'
  import RoomAccessPopup from './RoomAccessPopup.svelte'
  import RoomLanguageSelector from './RoomLanguageSelector.svelte'
  import RoomModal from './RoomModal.svelte'
  import ShareSettingPopup from './ShareSettingPopup.svelte'
  import { Room as LKRoom } from 'livekit-client'

  export let room: Room
  export let canMaximize: boolean = true
  export let fullScreen: boolean = false
  export let onFullScreen: (() => void) | undefined = undefined

  let allowCam: boolean = false
  const allowShare: boolean = true
  let allowLeave: boolean = false
  let noLabel: boolean = false

  $: allowCam = $currentRoom?.type === RoomType.Video
  $: allowLeave = $myInfo?.room !== ($myOffice?._id ?? love.ids.Reception)

  async function changeMute (): Promise<void> {
    await setMic(!$isMicEnabled)
  }

  async function changeCam (): Promise<void> {
    await setCam(!$isCameraEnabled)
  }

  async function changeShare (): Promise<void> {
    const newValue = !$isSharingEnabled
    const audio = newValue && $isShareWithSound
    await setShare(newValue, audio)
  }

  async function leave (): Promise<void> {
    await leaveRoom($myInfo, $myOffice)
  }

  function micSettings (e: MouseEvent): void {
    showPopup(MicSettingPopup, {}, eventToHTMLElement(e))
  }

  function camSettings (e: MouseEvent): void {
    showPopup(CamSettingPopup, {}, eventToHTMLElement(e))
  }

  function shareSettings (e: MouseEvent): void {
    showPopup(ShareSettingPopup, {}, eventToHTMLElement(e))
  }

  function setAccess (e: MouseEvent): void {
    if (isOffice(room) && room.person !== me) return
    showPopup(RoomAccessPopup, { room }, eventToHTMLElement(e))
  }

  const me = getCurrentEmployee()
  const client = getClient()

  const camKeys = client.getModel().findAllSync(view.class.Action, { _id: love.action.ToggleVideo })?.[0]?.keyBinding
  const micKeys = client.getModel().findAllSync(view.class.Action, { _id: love.action.ToggleMic })?.[0]?.keyBinding

  let actions: Action[] = []
  let moreItems: DropdownIntlItem[] = []

  $: void getActions(client, room, love.class.Room).then((res) => {
    actions = res
  })

  $: moreItems = actions.map((action) => ({
    id: action._id,
    label: action.label,
    icon: action.icon
  }))

  async function handleMenuOption (e: CustomEvent<DropdownIntlItem['id']>): Promise<void> {
    const action = actions.find((action) => action._id === e.detail)
    if (action !== undefined) {
      await handleAction(action)
    }
  }

  async function handleAction (action: Action): Promise<void> {
    const fn = await getResource(action.action)
    await fn(room)
  }
  $: withVideo = $screenSharing || room.type === RoomType.Video

  function maximize (): void {
    showPopup(RoomModal, { room }, 'full-centered')
  }
</script>

<ControlBarContainer bind:noLabel>
  <!-- <svelte:fragment slot="right">
    {#if $isConnected && isTranscriptionAllowed() && $isTranscription}
      <RoomLanguageSelector {room} kind="icon" />
    {/if}
  </svelte:fragment> -->
  <svelte:fragment slot="center">
    {#if room._id !== love.ids.Reception}
      <ModernButton
        icon={roomAccessIcon[room.access]}
        iconProps={{
          fill:
            room.access === RoomAccess.Open
              ? 'var(--bg-positive-default)'
              : room.access === RoomAccess.DND
                ? 'var(--bg-negative-default)'
                : 'currentColor'
        }}
        tooltip={{ label: love.string.ChangeAccess }}
        kind={'secondary'}
        size={'large'}
        disabled={isOffice(room) && room.person !== me}
        on:click={setAccess}
      />
    {/if}
    {#if $isConnected}
      <SplitButton
        size={'large'}
        icon={$isMicEnabled ? love.icon.MicEnabled : love.icon.MicDisabled}
        showTooltip={{
          label: !$isMicAllowed ? love.string.MicPermission : $isMicEnabled ? love.string.Mute : love.string.UnMute,
          keys: micKeys
        }}
        action={changeMute}
        disabled={!$isMicAllowed}
        secondIcon={IconUpOutline}
        secondAction={micSettings}
        separate
      />
      {#if allowCam}
        <SplitButton
          size={'large'}
          icon={$isCameraEnabled ? love.icon.CamEnabled : love.icon.CamDisabled}
          showTooltip={{
            label: !$isCamAllowed
              ? love.string.CamPermission
              : $isCameraEnabled
                ? love.string.StopVideo
                : love.string.StartVideo,
            keys: camKeys
          }}
          disabled={!$isCamAllowed}
          action={changeCam}
          secondIcon={IconUpOutline}
          secondAction={camSettings}
          separate
        />
      {/if}
      {#if allowShare}
        <SplitButton
          size={'large'}
          icon={$isSharingEnabled ? love.icon.SharingEnabled : love.icon.SharingDisabled}
          iconProps={{
            fill: $isSharingEnabled ? 'var(--bg-negative-default)' : 'var(--bg-positive-default)'
          }}
          showTooltip={{ label: $isSharingEnabled ? love.string.StopShare : love.string.Share }}
          disabled={($screenSharing && !$isSharingEnabled) || !$isConnected}
          action={changeShare}
          secondIcon={IconUpOutline}
          secondAction={shareSettings}
          separate
        />
      {/if}
      {#if hasAccountRole(getCurrentAccount(), AccountRole.User) && $isRecordingAvailable}
        <ModernButton
          icon={$isRecording ? love.icon.StopRecord : love.icon.Record}
          tooltip={{ label: $isRecording ? love.string.StopRecord : love.string.Record }}
          disabled={!$isConnected}
          kind={'secondary'}
          size={'large'}
          on:click={() => record(room)}
        />
      {/if}
      {#if hasAccountRole(getCurrentAccount(), AccountRole.User) && isTranscriptionAllowed() && $isConnected}
        <ModernButton
          icon={view.icon.Feather}
          iconProps={$isTranscription ? { fill: 'var(--button-negative-BackgroundColor)' } : {}}
          tooltip={{ label: $isTranscription ? love.string.StopTranscription : love.string.StartTranscription }}
          kind="secondary"
          size="large"
          on:click={() => {
            if ($isTranscription) {
              void stopTranscription(room)
            } else {
              void startTranscription(room)
            }
          }}
        />
      {/if}
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="left">
    {#if $isConnected && withVideo && onFullScreen}
      <ModernButton
        icon={$isFullScreen ? love.icon.ExitFullScreen : love.icon.FullScreen}
        tooltip={{
          label: $isFullScreen ? love.string.ExitingFullscreenMode : love.string.FullscreenMode,
          direction: 'top'
        }}
        kind={'secondary'}
        size={'large'}
        on:click={() => {
          $isFullScreen = !$isFullScreen
        }}
      />
    {/if}

    {#if ($screenSharing || room.type === RoomType.Video) && $isConnected && canMaximize}
      <ModernButton
        icon={IconMaximize}
        tooltip={{
          label: love.string.FullscreenMode,
          direction: 'top'
        }}
        kind={'secondary'}
        iconSize="medium"
        size={'large'}
        on:click={maximize}
      />
    {/if}
    {#if $isConnected && moreItems.length > 0}
      <ButtonMenu
        items={moreItems}
        icon={IconMoreV}
        tooltip={{ label: love.string.MoreOptions, direction: 'top' }}
        kind="secondary"
        size="large"
        noSelection
        on:selected={handleMenuOption}
      />
    {/if}
    {#if allowLeave}
      <ModernButton
        icon={love.icon.LeaveRoom}
        label={noLabel ? undefined : love.string.LeaveRoom}
        tooltip={{ label: love.string.LeaveRoom, direction: 'top' }}
        kind={'negative'}
        size={'large'}
        on:click={leave}
      />
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="extra">
    {#if fullScreen}
      <Popup fullScreen />
      <TooltipInstance fullScreen />
    {/if}
  </svelte:fragment>
</ControlBarContainer>
