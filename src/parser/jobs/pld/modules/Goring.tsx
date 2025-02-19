import {Trans} from '@lingui/react'
import {ActionLink, StatusLink} from 'components/ui/DbLink'
import ACTIONS from 'data/ACTIONS'
import STATUSES from 'data/STATUSES'
import {dependency} from 'parser/core/Injectable'
import Checklist, {Requirement, Rule} from 'parser/core/modules/Checklist'
import {DoTs} from 'parser/core/modules/DoTs'
import Suggestions, {SEVERITY, TieredSuggestion} from 'parser/core/modules/Suggestions'
import React from 'react'

const SEVERITIES = {
	CLIPPING: {
		2500: SEVERITY.MINOR,
		5000: SEVERITY.MEDIUM,
		10000: SEVERITY.MAJOR,
	},
}

export class Goring extends DoTs {
	static override handle = 'goring'

	@dependency private checklist!: Checklist
	@dependency private suggestions!: Suggestions

	override trackedStatuses = [
		STATUSES.GORING_BLADE.id,
	]

	override addChecklistRules() {
		this.checklist.add(new Rule({
			name: 'Keep your Goring Blade up',
			description: <Trans id="pld.goring.checklist.goringblade.description">
				As a Paladin, <ActionLink {...ACTIONS.GORING_BLADE}/> is a significant portion of your sustained
				damage, and is required to kept up for as much as possible, for the best damage output.
			</Trans>,
			target: 90,
			requirements: [
				new Requirement({
					name: <Trans id="pld.goring.checklist.goringblade.requirement.uptime"><ActionLink {...ACTIONS.GORING_BLADE} /> uptime</Trans>,
					percent: () => this.getUptimePercent(STATUSES.GORING_BLADE.id),
				}),
			],
		}))
	}

	override addClippingSuggestions() {
		const goringClipPerMinute = this.getClippingAmount(this.data.statuses.GORING_BLADE.id)

		// Suggestion for Goring Blade DoT clipping
		this.suggestions.add(new TieredSuggestion({
			icon: ACTIONS.GORING_BLADE.icon,
			content: <Trans id="pld.goring.suggestions.goringblade.content">
				Avoid refreshing <ActionLink {...ACTIONS.GORING_BLADE} /> significantly before it's expiration.
			</Trans>,
			why: <Trans id="pld.goring.suggestions.goringblade.why">
				An average of {this.parser.formatDuration(goringClipPerMinute, 1)} seconds of <StatusLink {...STATUSES.GORING_BLADE}/> per minute lost to early refreshes.
			</Trans>,
			tiers: SEVERITIES.CLIPPING,
			value: goringClipPerMinute,
		}))
	}
}
