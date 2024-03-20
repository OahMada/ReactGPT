// https://stackoverflow.com/a/52854585/5800789

export function isTouchDevice() {
	if (window.matchMedia('(pointer: coarse)').matches) {
		return true;
	}
	return false;
}
