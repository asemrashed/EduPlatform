/**
 * Static marketing copy for CMS seed defaults and hero/FAQ fallbacks.
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
    a: `We offer a wide range of courses across various domains including technology, business, design, marketing, and more. Each course is designed to provide in-depth knowledge and practical skills to help you excel in your career.`,
  },
  {
    q: "How can I enroll?",
    a: `Simply click the "Enroll Course" button on any course card or navigate to the course details page. You can pay via credit card, PayPal, or use your corporate learning credits. Once processed, you'll have instant access to all materials.`,
  },
  {
    q: "Do I get a certificate upon completion?",
    a: `Yes, upon successful completion of a course, you will receive a certificate that you can download and share.`,
  },
  {
    q: "Is there a group discount for institutions?",
    a: `Yes, we offer special pricing for institutions and organizations looking to provide learning opportunities for their teams. Please contact our sales team for more information.`,
  },
] as const;
