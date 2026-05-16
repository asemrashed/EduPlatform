export interface GalleryImage {
  id: number;
  image: string;
  alt: string;
}

export interface PhotoGalleryContent {
  label: {
    text: string;
    backgroundColor: string;
  };
  title: {
    part1: string;
    part2: string;
  };
  titleColors: {
    part1: string;
    part2: string;
  };
  gradientColors?: {
    from: string;
    via?: string;
    to: string;
  };
  images: GalleryImage[];
}

export const defaultPhotoGalleryContent: PhotoGalleryContent = {
  label: {
    text: "আমাদের গ্যালারি",
    backgroundColor: "#A855F7",
  },
  title: {
    part1: "আসুন দেখি আমাদের",
    part2: "ফটো গ্যালারি",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "gradient", // Can be gradient or color
  },
  gradientColors: {
    from: "#A855F7",
    via: "#14B8A6",
    to: "#10B981",
  },
  images: [
    {
      id: 1,
      image: "https://live.themewild.com/edubo/assets/img/gallery/01.jpg",
      alt: "Student with folders and backpack",
    },
    {
      id: 2,
      image: "https://live.themewild.com/edubo/assets/img/gallery/02.jpg",
      alt: "Student working on laptop",
    },
    {
      id: 3,
      image: "https://live.themewild.com/edubo/assets/img/gallery/03.jpg",
      alt: "Student with books and headphones",
    },
    {
      id: 4,
      image: "https://live.themewild.com/edubo/assets/img/gallery/04.jpg",
      alt: "Student studying at desk",
    },
    {
      id: 5,
      image: "https://live.themewild.com/edubo/assets/img/gallery/05.jpg",
      alt: "Students collaborating on project",
    },
    {
      id: 6,
      image: "https://live.themewild.com/edubo/assets/img/gallery/06.jpg",
      alt: "Students in classroom",
    },
    {
      id: 7,
      image: "https://live.themewild.com/edubo/assets/img/gallery/07.jpg",
      alt: "Student with books",
    },
    {
      id: 8,
      image: "https://live.themewild.com/edubo/assets/img/gallery/08.jpg",
      alt: "Students at outdoor table",
    },
  ],
};

