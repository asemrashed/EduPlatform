/**
 * Static marketing copy and media URLs from Frontend-design/HomePage.html
 * (visual source of truth — no API).
 */

export const HOME_HERO = {
  eyebrow: "Premier Digital Learning",
  titleBefore: "Shape Your Future with the ",
  titleAccent: "Right Knowledge",
  description:
    "Join 20,000+ students mastering the world's most in-demand skills through high-end editorial learning experiences curated by industry leaders.",
  heroImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA31RkH7_XZz2aDd0xstgLrl32VX8pLZAQTNxwSHRJFvS3r1qNkqaaHKjlWsCA7C18zyIMAzL_qw0Iw53YXshQoVyfPVsvWDnx0Ec3LB8Lz1wOJLvuwyafkrSneNnPDwi0hbJ9OArzRXv761Zw_KRWYbcBBpZw8Kd6D3Io25YHaVIlJqc_JqMnzIpDlzD-f8RRkrJ1qTLI1phSD-P9S5kqyBNVMMcm_xucMHgGI6PoQx5U0XwHz331jra4z9cH3w8XWs60md6N9ZSw",
};

export const HOME_STATS = [
  { value: "100%", label: "Satisfaction" },
  { value: "12+", label: "Years Experience" },
  { value: "20k+", label: "Total Courses" },
  { value: "90+", label: "Course Categories" },
] as const;

export type HomeFeaturedCourse = {
  image: string;
  imageAlt: string;
  badge: string;
  badgeClass: string;
  title: string;
  description: string;
  price: string;
  lessons: string;
};

export const HOME_FEATURED_COURSES: HomeFeaturedCourse[] = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEnqaLX5DpNws_hG-y8yjltzbzFCjKpirQbdqb-WhfmcgGk9XfvshQwIGUWBkwctPB90eQZya1l5ljThiFX_K6tDhKACQyuPZcI7Hg0gKzjsmfJzor5mBJh5VBVYxoQU1Hi7ILNeUtunjElWQmo8vAtgmJduFHnpV_BPhHS8E7s7CSpgjOpIrOBSMNf1i_KBOefQc-QLOg8pQ7Gtg0tTyI7ZGcMXEIxdQFpwrZptXzEkHTr2wm0UpjFHLT0cQKEtQhRuB_7krwGM",
    imageAlt: "Web Development",
    badge: "Web Development",
    badgeClass: "bg-primary text-on-primary",
    title: "Mastering Full-Stack React",
    description:
      "Build production-ready applications with the latest ecosystem including Next.js, Tailwind, and Prisma.",
    price: "$89.99",
    lessons: "24+ Lessons",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBoiToqX3yYGBeyUVQ35wM2BqO6_RvTMcp91ASXH76XlX9lVuV6htNl4742zyAAlN9FeeF-OE3_IrA75g0PGLd5KreyhCWhI97zOigJCWnfEXQngYXfj8DIXFsR9Pp7X2HXvm1DkJnPg9qQ5BAQ3MSbJGqI5t28rEZSs1IW6D4vX0iE8CbrtD_I_zSkO8mSXFCw1-SBXDuq9NQnMoF_7FmlowFREN_lXOPIXGAu7nbc5f9kLevehz6lnr-_KofkMjMERDqu5cFTBaA",
    imageAlt: "Marketing",
    badge: "Marketing",
    badgeClass: "bg-secondary text-on-secondary",
    title: "Data-Driven Growth Marketing",
    description:
      "Learn advanced analytics and psychology to scale digital products through sustainable growth loops.",
    price: "$120.00",
    lessons: "18+ Lessons",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLpJ3sr7CNBSKioUI-FzSDj3apnVgQxNJa6EMHg-EVuVbI_vwT_sY-c_PZiLh02rf0HBPIxyT1UWMrgNtyAmjMmII-UHzWDekv2yYPOOj6b9Kt0wrmVOPQM1ShmK9BS1TbWULGgNWuO_ew6NkJ50omda9j3qp6c3pkIMZ2RMap-LZkAmIFj8-mKp7qqnCtN8Qi3OPuAcjsffqEwsh_nScX5dQmvPRlRb5Q_FR-N1wrYR60x784KuWoUWfrwOyw4EyWbjWY1I2Lgf8",
    imageAlt: "AI Specialist",
    badge: "Artificial Intelligence",
    badgeClass: "bg-tertiary-container text-on-tertiary-container",
    title: "Introduction to LLM Architectures",
    description:
      "Understand the foundation of GPT, BERT and Llama models. Perfect for engineers wanting to pivot to AI.",
    price: "$199.00",
    lessons: "32+ Lessons",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEnqaLX5DpNws_hG-y8yjltzbzFCjKpirQbdqb-WhfmcgGk9XfvshQwIGUWBkwctPB90eQZya1l5ljThiFX_K6tDhKACQyuPZcI7Hg0gKzjsmfJzor5mBJh5VBVYxoQU1Hi7ILNeUtunjElWQmo8vAtgmJduFHnpV_BPhHS8E7s7CSpgjOpIrOBSMNf1i_KBOefQc-QLOg8pQ7Gtg0tTyI7ZGcMXEIxdQFpwrZptXzEkHTr2wm0UpjFHLT0cQKEtQhRuB_7krwGM",
    imageAlt: "Web Development",
    badge: "Web Development",
    badgeClass: "bg-primary text-on-primary",
    title: "Mastering Full-Stack React",
    description:
      "Build production-ready applications with the latest ecosystem including Next.js, Tailwind, and Prisma.",
    price: "$89.99",
    lessons: "24+ Lessons",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7hl9zsOd-3Sn23zsYHepmh7DEakOisLm0syUotKMY1pzJ9pkQOXJtDAanEMcKAb0rKa0tV3tOsrK3U8wRxYnfe0s2iQIbEjVGHzH26nAZ3b-TP4Ag29VY17b7xAQHnCiQo7khFq7MXwcs75gBd7B5-zX4OGq19HRN_l-IrlpqfOrjvgAgglGxvsnp_j02A94moGIGOeHiAip6RGo37rK7_qZcB9qYYGzvEqYdvrMVlDLObPfJeS6H0Y7GbCYcasS6VamUVdsTxqA",
    imageAlt: "Data Science",
    badge: "Data Science",
    badgeClass: "bg-primary text-on-primary",
    title: "Advanced Predictive Analytics & ML",
    description:
      "Master complex forecasting models and deep learning frameworks for enterprise-level data projects.",
    price: "$159.00",
    lessons: "28+ Lessons",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2_at0ufCiQxFIaQKzVDzst2T7ITs2dYE4d5VJNHvVD9613ohVBLvAuLamwptpy5dOmB06x_nEMTky6dQBTh3M1YReCwWMa-hjqqSnaYw2ICjJ5gINl1dM5Y80fLmE01DnSZ8C_i4qmG8kInR78TDI8Mqd_Q9WX5YNiWtwUxKXphtMF357K0XNz0-78JrGgtnZFgAwrU8h6YLhtgD1rWrGqTLOeMp75NRGLcMR7EuZg6EwG6t99BsJ8d1hFkFXsi0gy683Al3RpDs",
    imageAlt: "Business Management",
    badge: "Management",
    badgeClass: "bg-secondary text-on-secondary",
    title: "Executive Strategic Management",
    description:
      "A high-level blueprint for organizational leadership, decision-making, and scaling global enterprises.",
    price: "$299.00",
    lessons: "15+ Lessons",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBd0xH-uGSQcdy_EdbIlK_hu8mD3YoT-EBhm4L9CbkENrQS1yjchXJG-hOetWXYjIf1fbXUVPmDcbiqU9N3UgPl0LqIELYEoeq5zCTQkUwTHlSFev5lYAsxRGYdA3jgW0DE85h2_360e5K4RBX5-jgnbDIdvYqEis-9cL5h7t9rN4nVA0BzYjULjbm_GZrVfqd9aFO-2Dbei6PmX4qze5wtVStGjPce3OjgwJxFsyHSK-g3mRw8eQClrsgbaLIocmkfC6FXhPMO1Z0",
    imageAlt: "Cybersecurity",
    badge: "Security",
    badgeClass: "bg-[#0040a1] text-on-primary",
    title: "Cybersecurity Essentials",
    description:
      "Protect digital assets with modern defensive techniques, encryption standards, and threat modeling.",
    price: "$110.00",
    lessons: "20+ Lessons",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtEnqaLX5DpNws_hG-y8yjltzbzFCjKpirQbdqb-WhfmcgGk9XfvshQwIGUWBkwctPB90eQZya1l5ljThiFX_K6tDhKACQyuPZcI7Hg0gKzjsmfJzor5mBJh5VBVYxoQU1Hi7ILNeUtunjElWQmo8vAtgmJduFHnpV_BPhHS8E7s7CSpgjOpIrOBSMNf1i_KBOefQc-QLOg8pQ7Gtg0tTyI7ZGcMXEIxdQFpwrZptXzEkHTr2wm0UpjFHLT0cQKEtQhRuB_7krwGM",
    imageAlt: "Web Development",
    badge: "Web Development",
    badgeClass: "bg-primary text-on-primary",
    title: "Mastering Full-Stack React",
    description:
      "Build production-ready applications with the latest ecosystem including Next.js, Tailwind, and Prisma.",
    price: "$89.99",
    lessons: "24+ Lessons",
  },
];

export const HOME_FEATURES_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4hJNB4ZGj-XYYhd_-dq7X7y-9h716Q5KpN36ZAiZHpfsnEfbqhsUrqKSB6xe9rL-TGAfAbH0nmtZaJlh5_AqYbesdI4Vrj6yi9aQe2ZrKxBLyYWMjQuK-UA9jR0TOdElPay8PKf5U0-BBX9EkMnbR8X40VuaLDAMRh1_MXNpg9H76jWFYdOh7zklT_vVMAxauIWqmdMgOwtFhiOLYjnXyYmxcfp7tZRjWAQIHFpkr1aox-bJQ5gTNrQRCtaDUr7kyvZuTHhxSido";

export const HOME_FEATURES = [
  {
    icon: "route",
    iconBg: "bg-primary",
    title: "Personalized Learning Paths",
    body: "AI-driven curriculum adjustment based on your progress and goals.",
  },
  {
    icon: "video_chat",
    iconBg: "bg-secondary",
    title: "Live Sessions & Webinars",
    body: "Interact weekly with industry pioneers in high-bandwidth live events.",
  },
  {
    icon: "dashboard",
    iconBg: "bg-[#0040a1]",
    title: "Student Dashboard",
    body: "Track every milestone with our comprehensive data-rich student panel.",
  },
  {
    icon: "groups",
    iconBg: "bg-tertiary-container",
    title: "Community & Networking",
    body: "Access private forums and global networking events with elite alumni.",
  },
] as const;

export const HOME_EXPERTS = [
  {
    name: "Dr. Aris Thorne",
    role: "Lead AI Researcher · AI Expert",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqdszUZsxyuhbFoxc1mM_EYA1ZI51631E4KDsdxFucXzzqAtwo93vJBgFHWctzHiiN4L8QIQwEA13kZD6AUNbjPsoWI4UPGczwAH83Fr2bG-YOjcE_RLqjt3c8srvn4lLd6ZySEhwqqPyMjcntE9n1FrGNkhNldHyNqUB9Q9pPMoDxCaEQtkfXfWiPmabVmqP82Kin-PWYiE8wclYXxN_u3jooJKQDt9GcTF_u8_nq5KLAkk0893gi08tMUh6pZrdE_x5oPKBSeIU",
  },
  {
    name: "Sarah Jenkins",
    role: "Cybersecurity Specialist · InfoSec Lead",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLulBNTCzFvHOvbWajMX9-9jbGn3oe5-p1blgwoKyurRhkbaXC1zdvDXj5TFHeTqJMQDZnp2D2406jOAf4_tBNrwCWIsEIWdavR7B_vMm4SNtGNRTgJ_UVu-Ppe1r0aWT1gf3x3Q2gMZ6trRmdgjp4z6d4UIe4ASQZxHiFXQgkovszeDdtxU1ueH_qvS0cXJB_Y4l5YMLwBMjDW_Rmm16-RAKOK2k3RdHQoDYrRv-LAw9xY24_iZ62KneJbZI9yrrIeRQ0gup-Gmc",
  },
  {
    name: "Marko Rossi",
    role: "UX Strategy Lead · Product Designer",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAzhzlSEEmlRchpL2xXcTOGITDbtogtMIusKUzc50bI2gyWL143Ixrykd2hhmQ6Xf8iYw88tSZrb_Xml1ruRBfkkAPtZjcOfMewwwwJpMbmQvjtTzDdY-OHM8wwXmVhuwbp_kf2E0YvUusGhtpxYzKw-9wudC9Ih2lrcVgB-eqm3ziXnayg0cJK0Q4z9RMiInUAp18NsYh2YnGqs6FtzEXtNXhbdVuHwgjUCsFzajfvcjGgSal_tsOamc6f9izM2FM7c0brRBspqgQ",
  },
  {
    name: "Elena Vance",
    role: "Venture Strategist · Growth Marketing",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpfIr-UhwIGNQ0Z7dTr7dMLKNSt2wYWME0NLWcFBIjNSijzZ8MjBMVYJRUKdQv34DnAdx7xOa0D5pHaoCHmlVof32G7vErbFg1eF-iEyfQl7EnnMt1JrzPBkIYHTzd2SPSS8Aj3cEXwYxpzc-P00zV_Yr_Py_LPBadeO3du9imK-woqaE3oEffG1qKLLZ_SdAaCb_DOAN_EGJdSZTcKAlzI8mn3Y4AcU9nBouOZ06MnWxek-GUoOtWEChz5eVI4jwwdWSrxVfUnMo",
  },
];

export const HOME_TESTIMONIALS = [
  {
    quote:
      "The editorial quality of the video content is unlike any other platform. It feels like watching a high-end documentary about your future career.",
    name: "Julianne Moore",
    role: "Senior Product Manager",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDs-W6RydD8iN6HolJVDEHmeJ0oGuvh9Nr-nDoyGpHxDe5yxb07hgh1qizLK3v0FZuAWiZq8FmrkkMyikzcvd5_uZ4mTNPQCAzOSYPddUZM9HWGI8fQXPOP9Y7P_lJjIBaJtSVllTcffIuabP8VaEc7fSafeWcO0r6MCv5tMxdNNM176_QjZtIl8LTMw46e1mi0aMu5N9BodJnd0snjXjBdlgvALAGX8VgT_A9dyAISCDiWTgE7QRJk7x7thMvJnz2cEfUl2ustxa4",
  },
  {
    quote:
      "The mentor network alone is worth the subscription. I secured my latest role through a connection made in the Lumina private forums.",
    name: "David Chen",
    role: "Security Engineer",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAIdIIOSwDFfDQCWB2womT3FBYU8vpp6pbH_3diDvkg-jwE4aR9Ii4fL-PgnSPjEinSh0njgyc6YpqHr0n18N2JqE4UlMDWeB2mhrlsKCCUOIwkZz-vsz7PYwtOCVD4OLWhxe8xv_g2FjFFZKI4vnT0B73l1czK-berq0VBQYHuETdAt3iMH1ylBuz4z8a41oo9wDMgSuwzq8qL8Kq8E4CUYUo0YzfnbLNQLIlHXahysAw44-0l6z_uZB3njXvadCHAr2ydueL-6t0",
  },
];

export const HOME_PARTNERS = [
  "HubSpot",
  "Zoom",
  "Zendesk",
  "Notion",
  "Slack",
] as const;

export const HOME_FAQ = [
  {
    q: "What types of courses do you offer?",
    a: null,
  },
  {
    q: "How can I enroll?",
    a: `Simply click the "Enroll Course" button on any course card or navigate to the course details page. You can pay via credit card, PayPal, or use your corporate learning credits. Once processed, you'll have instant access to all materials.`,
  },
  {
    q: "Do I get a certificate upon completion?",
    a: null,
  },
  {
    q: "Is there a group discount for institutions?",
    a: null,
  },
] as const;
