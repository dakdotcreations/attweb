// Picks a fitting icon for a service from its slug/name (services have no icon field).
import BinocularsIcon from '@lucide/svelte/icons/binoculars';
import BriefcaseIcon from '@lucide/svelte/icons/briefcase-business';
import BusIcon from '@lucide/svelte/icons/bus';
import CarIcon from '@lucide/svelte/icons/car';
import CompassIcon from '@lucide/svelte/icons/compass';
import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
import HotelIcon from '@lucide/svelte/icons/hotel';
import PalmtreeIcon from '@lucide/svelte/icons/tree-palm';
import PlaneIcon from '@lucide/svelte/icons/plane';
import ShieldPlusIcon from '@lucide/svelte/icons/shield-plus';
import StampIcon from '@lucide/svelte/icons/stamp';
import StethoscopeIcon from '@lucide/svelte/icons/stethoscope';
import TreesIcon from '@lucide/svelte/icons/trees';

const rules: [RegExp, typeof CompassIcon][] = [
	[/gorilla|chimp|primate|forest/, TreesIcon],
	[/wildlife|safari|game/, BinocularsIcon],
	[/medical|health|hospital|treatment/, StethoscopeIcon],
	[/visa|passport|document/, StampIcon],
	[/study|student|universit|education|scholar/, GraduationCapIcon],
	[/school/, BusIcon],
	[/flight|ticket|air(?!port)/, PlaneIcon],
	[/hotel|accommodation|lodg/, HotelIcon],
	[/car|transfer|airport|rental|transport/, CarIcon],
	[/corporate|business/, BriefcaseIcon],
	[/insurance/, ShieldPlusIcon],
	[/holiday|beach|vacation|getaway|honeymoon/, PalmtreeIcon]
];

export function serviceIcon(slug: string, name = '') {
	const text = `${slug} ${name}`.toLowerCase();
	return rules.find(([re]) => re.test(text))?.[1] ?? CompassIcon;
}
