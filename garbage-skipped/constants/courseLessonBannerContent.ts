export interface CourseLessonBannerContent {
  enabled: boolean;
  title: string;
  imageUrl: string;
}

export const defaultCourseLessonBannerContent: CourseLessonBannerContent = {
  enabled: true,
  title: 'আজকের লেসনে স্বাগতম',
  imageUrl: '',
};
