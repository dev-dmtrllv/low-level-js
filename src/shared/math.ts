export namespace math
{
	export const clamp = (val: number, min: number, max: number): number => val > max ? max : val < min ? min : val;
}
