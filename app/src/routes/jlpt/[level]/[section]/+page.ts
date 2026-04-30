export const load = ({ params }: { params: { level: string; section: string } }) => {
	return {
		level: params.level,
		section: params.section
	};
};
