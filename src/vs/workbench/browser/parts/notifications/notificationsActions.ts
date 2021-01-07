/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/notificationsActions.css';
import { INotificationViewItem } from 'vs/workbench/common/notifications';
import { localize } from 'vs/nls';
import { Action, IAction, ActionRunner, WorkbenchActionExecutedEvent, WorkbenchActionExecutedClassification } from 'vs/base/common/actions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { CLEAR_NOTIFICATION, EXPAND_NOTIFICATION, COLLAPSE_NOTIFICATION, CLEAR_ALL_NOTIFICATIONS, HIDE_NOTIFICATIONS_CENTER } from 'vs/workbench/browser/parts/notifications/notificationsCommands';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { Codicon } from 'vs/base/common/codicons';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';

const clearIcon = registerIcon('notifications-clear', Codicon.close, localize('clearIcon', 'Icon for the clear action in notifications.'));
const clearAllIcon = registerIcon('notifications-clear-all', Codicon.clearAll, localize('clearAllIcon', 'Icon for the clear all action in notifications.'));
const hideIcon = registerIcon('notifications-hide', Codicon.chevronDown, localize('hideIcon', 'Icon for the hide action in notifications.'));
const expandIcon = registerIcon('notifications-expand', Codicon.chevronUp, localize('expandIcon', 'Icon for the expand action in notifications.'));
const collapseIcon = registerIcon('notifications-collapse', Codicon.chevronDown, localize('collapseIcon', 'Icon for the collapse action in notifications.'));
const configureIcon = registerIcon('notifications-configure', Codicon.gear, localize('configureIcon', 'Icon for the configure action in notifications.'));

export class ClearNotificationAction extends Action {

	static readonly ID = CLEAR_NOTIFICATION;
	static readonly LABEL = localize('clearNotification', "Clear Notification");

	constructor(
		id: string,
		label: string,
		@ICommandService private readonly commandService: ICommandService
	) {
		super(id, label, ThemeIcon.asClassName(clearIcon));
	}

	async run(notification: INotificationViewItem): Promise<void> {
		this.commandService.executeCommand(CLEAR_NOTIFICATION, notification);
	}
}

export class ClearAllNotificationsAction extends Action {

	static readonly ID = CLEAR_ALL_NOTIFICATIONS;
	static readonly LABEL = localize('clearNotifications', "Clear All Notifications");

	constructor(
		id: string,
		label: string,
		@ICommandService private readonly commandService: ICommandService
	) {
		super(id, label, ThemeIcon.asClassName(clearAllIcon));
	}

	async run(): Promise<void> {
		this.commandService.executeCommand(CLEAR_ALL_NOTIFICATIONS);
	}
}

export class HideNotificationsCenterAction extends Action {

	static readonly ID = HIDE_NOTIFICATIONS_CENTER;
	static readonly LABEL = localize('hideNotificationsCenter', "Hide Notifications");

	constructor(
		id: string,
		label: string,
		@ICommandService private readonly commandService: ICommandService
	) {
		super(id, label, ThemeIcon.asClassName(hideIcon));
	}

	async run(): Promise<void> {
		this.commandService.executeCommand(HIDE_NOTIFICATIONS_CENTER);
	}
}

export class ExpandNotificationAction extends Action {

	static readonly ID = EXPAND_NOTIFICATION;
	static readonly LABEL = localize('expandNotification', "Expand Notification");

	constructor(
		id: string,
		label: string,
		@ICommandService private readonly commandService: ICommandService
	) {
		super(id, label, ThemeIcon.asClassName(expandIcon));
	}

	async run(notification: INotificationViewItem): Promise<void> {
		this.commandService.executeCommand(EXPAND_NOTIFICATION, notification);
	}
}

export class CollapseNotificationAction extends Action {

	static readonly ID = COLLAPSE_NOTIFICATION;
	static readonly LABEL = localize('collapseNotification', "Collapse Notification");

	constructor(
		id: string,
		label: string,
		@ICommandService private readonly commandService: ICommandService
	) {
		super(id, label, ThemeIcon.asClassName(collapseIcon));
	}

	async run(notification: INotificationViewItem): Promise<void> {
		this.commandService.executeCommand(COLLAPSE_NOTIFICATION, notification);
	}
}

export class ConfigureNotificationAction extends Action {

	static readonly ID = 'workbench.action.configureNotification';
	static readonly LABEL = localize('configureNotification', "Configure Notification");

	constructor(
		id: string,
		label: string,
		public readonly configurationActions: ReadonlyArray<IAction>
	) {
		super(id, label, ThemeIcon.asClassName(configureIcon));
	}
}

export class CopyNotificationMessageAction extends Action {

	static readonly ID = 'workbench.action.copyNotificationMessage';
	static readonly LABEL = localize('copyNotification', "Copy Text");

	constructor(
		id: string,
		label: string,
		@IClipboardService private readonly clipboardService: IClipboardService
	) {
		super(id, label);
	}

	run(notification: INotificationViewItem): Promise<void> {
		return this.clipboardService.writeText(notification.message.raw);
	}
}

export class NotificationActionRunner extends ActionRunner {

	constructor(
		@ITelemetryService private readonly telemetryService: ITelemetryService,
		@INotificationService private readonly notificationService: INotificationService
	) {
		super();
	}

	protected async runAction(action: IAction, context: INotificationViewItem): Promise<void> {
		this.telemetryService.publicLog2<WorkbenchActionExecutedEvent, WorkbenchActionExecutedClassification>('workbenchActionExecuted', { id: action.id, from: 'message' });

		// Run and make sure to notify on any error again
		try {
			await super.runAction(action, context);
		} catch (error) {
			this.notificationService.error(error);
		}
	}
}
