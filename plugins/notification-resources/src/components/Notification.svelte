<script lang="ts">
  import { Avatar, getPersonByPersonIdCb } from '@hcengineering/contact-resources'
  import { Class, Doc, Ref } from '@hcengineering/core'
  import { BrowserNotification } from '@hcengineering/notification'
  import { Button, navigate, Notification as PlatformNotification, NotificationToast } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import chunter, { ThreadMessage } from '@hcengineering/chunter'
  import { getResource } from '@hcengineering/platform'
  import activity, { ActivityMessage } from '@hcengineering/activity'
  import { getClient, playSound } from '@hcengineering/presentation'
  import { pushAvailable, subscribePush } from '../utils'
  import plugin from '../plugin'
  import { onMount } from 'svelte'
  import { Person } from '@hcengineering/contact'

  export let notification: PlatformNotification
  export let onRemove: () => void

  const client = getClient()
  const hierarchy = client.getHierarchy()

  $: value = notification.params?.value as BrowserNotification

  let sender: Person | undefined
  $: if (value.senderId !== undefined) {
    getPersonByPersonIdCb(value.senderId, (p) => {
      sender = p ?? undefined
    })
  } else {
    sender = undefined
  }

  async function openChannelInSidebar (): Promise<void> {
    if (!value.onClickLocation) return
    const { onClickLocation } = value
    let _id: Ref<Doc> | undefined = value.objectId
    let _class: Ref<Class<Doc>> | undefined = value.objectClass
    let thread = onClickLocation.path[4] as Ref<ActivityMessage> | undefined
    const selectedMessageId: Ref<ActivityMessage> | undefined = value.messageId

    if (_class && _id && hierarchy.isDerived(_class, activity.class.ActivityMessage)) {
      const message = await client.findOne<ActivityMessage>(_class, { _id: _id as Ref<ActivityMessage> })

      if (hierarchy.isDerived(_class, chunter.class.ThreadMessage)) {
        const threadMessage = message as ThreadMessage
        _id = threadMessage?.objectId
        _class = threadMessage?.objectClass
        thread = threadMessage?.attachedTo
      } else {
        _id = message?.attachedTo
        _class = message?.attachedToClass
        thread = (message?.replies ?? 0) > 0 ? message?._id : undefined
      }
    }

    onRemove()

    if (!_id || !_class || _id === '' || _class === '' || selectedMessageId === undefined) {
      navigate(onClickLocation)
      return
    }

    const fn = await getResource(chunter.function.OpenChannelInSidebar)
    await fn(_id, _class, undefined, thread, true, selectedMessageId)
  }

  onMount(async () => {
    if (!value.soundAlert) return
    await playSound(plugin.sound.InboxNotification)
  })
</script>

<NotificationToast title={notification.title} severity={notification.severity} onClose={onRemove}>
  <svelte:fragment slot="content">
    <div class="flex-row-center flex-wrap gap-2">
      {#if sender}
        <Avatar person={sender} name={sender.name} size={'small'} />
      {/if}
      <span class="overflow-label">
        {value.body}
      </span>
    </div>
  </svelte:fragment>

  <svelte:fragment slot="buttons">
    {#if value.onClickLocation}
      <Button
        label={view.string.Open}
        on:click={() => {
          void openChannelInSidebar()
        }}
      />
    {/if}
    <Button
      label={plugin.string.EnablePush}
      disabled={!pushAvailable()}
      showTooltip={!pushAvailable() ? { label: plugin.string.NotificationBlockedInBrowser } : undefined}
      on:click={subscribePush}
    />
  </svelte:fragment>
</NotificationToast>
