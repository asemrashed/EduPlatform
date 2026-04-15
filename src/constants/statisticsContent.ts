export interface StatisticsItem {
  id: number;
  number: string;
  suffix: string;
  label: string;
  labelBengali: string;
  iconType: 'students' | 'courses' | 'tutors' | 'awards';
}

export interface StatisticsContent {
  items: StatisticsItem[];
}

export const defaultStatisticsContent: StatisticsContent = {
  items: [
    {
      id: 1,
      number: "150",
      suffix: "k",
      label: "Students Enrolled",
      labelBengali: "নিবন্ধিত শিক্ষার্থী",
      iconType: "students",
    },
    {
      id: 2,
      number: "25",
      suffix: "K",
      label: "Total Courses",
      labelBengali: "মোট কোর্স",
      iconType: "courses",
    },
    {
      id: 3,
      number: "120",
      suffix: "+",
      label: "Expert Tutors",
      labelBengali: "বিশেষজ্ঞ শিক্ষক",
      iconType: "tutors",
    },
    {
      id: 4,
      number: "50",
      suffix: "+",
      label: "Win Awards",
      labelBengali: "পুরস্কার জিতেছে",
      iconType: "awards",
    },
  ],
};

