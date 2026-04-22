import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import about from "../../../public/about.jpg"

export const metadata: Metadata = {
  title: "About",
};

/** AboutUs.html — narrative + mission; static copy (Phase 3). CMS can follow in later phases. */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-screen-2xl pb-5 md:pb-10">
      <section className="relative flex h-[400px] items-center overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA49z5j8dNSWa9xyciQauqnApJ20f5WiqAAFt1WC0qJnfhMUz2PJC4u1-22QUWy7ne00W-7hNpWway3iinbaoTxzGVBdugweY_nGDoBhF9xnkL1QPXKw4AlJGLV35u6rQx1eW8GM9DaUFs5Zbl81chOkgg2lD0Fbct348O1Tyr3jCw1xpW7NDWRVmnI2cxsDNVGAeYALh7qYZ3FGBDKOoso9_EjggIWuvXSzy2uRtrm3XaWNlqGjaMQvFd3YkTCU4iLY_xewch068Y"
            alt=""
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-container" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-8">
          <div className="max-w-2xl">
            <span className="mb-4 block font-[family-name:var(--font-headline)] text-sm font-bold uppercase tracking-[0.2em] text-primary-container">
              Who we are
            </span>
            <h1 className="font-[family-name:var(--font-headline)] text-5xl font-black leading-[1.1] tracking-tight text-white md:text-6xl">
              The digital elite knowledge platform
            </h1>
            <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-on-primary-container opacity-90">
              We are a team of dedicated educators and professionals who are passionate about helping students achieve their academic goals.
            </p>
          </div>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-16 md:grid-cols-2 p-3 md:p-5">
        <div className="flex flex-col items-center justify-center">
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Welcome to Edu Platform, a premier education hub dedicated 
            to transforming academic dreams into reality. We bridge the 
            gap between aspiring students and top-tier global universities 
            through expert guidance, personalized counseling, and comprehensive
            test preparation. Our team specializes in holistic support,
            covering everything from university selection and 
            visa processing to pre-departure briefing. By combining
            years of experience with a network of world-class institutions, 
            we empower students to unlock their potential and achieve academic excellence. 
            Join us to build a solid foundation for your future and take 
            the first step toward a successful global career.
          </p>
        </div>
        <div>
          <Image src={about} alt="About Us" width={1000} height={500} className="rounded-2xl"/>
        </div>
      </section>

      <section className="mt-24 grid gap-12 md:grid-cols-3">
        {[
          {
            title: "Curation",
            body: "Courses are reviewed for clarity, outcomes, and instructional quality.",
          },
          {
            title: "Community",
            body: "Learners and instructors share feedback to keep content current.",
          },
          {
            title: "Integrity",
            body: "Clear policies and support — no hidden fees in mock checkout flows.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-border bg-card p-8 shadow-editorial"
          >
            <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold text-primary">
              {card.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{card.body}</p>
          </div>
        ))}
      </section>

      <div className="mt-16 text-center">
        <Link
          href="/courses"
          className="inline-flex rounded-xl bg-gradient-to-br from-primary to-primary/40 hover:bg-primary transition-all duration-300 px-8 py-3 font-bold text-on-primary shadow-lg"
        >
          Explore courses
        </Link>
      </div>
    </div>
  );
}
