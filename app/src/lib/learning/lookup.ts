import { ROADMAPS } from '$lib/data/roadmap';
import type { Lesson, RoadmapUnit } from '$lib/data/roadmap';

export interface LessonContext {
	lesson: Lesson;
	unit: RoadmapUnit;
	level: string;
}

export function findLesson(lessonId: string): LessonContext | null {
	for (const [level, units] of Object.entries(ROADMAPS)) {
		for (const unit of units) {
			const lesson = unit.lessons.find((l) => l.id === lessonId);
			if (lesson) return { lesson, unit, level };
		}
	}
	return null;
}
