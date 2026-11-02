import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const climateIssues = [
  {
    icon: "🌡️",
    title: "Extreme Heat",
    description:
      "Rising temperatures can affect human health, daily activities, and access to comfortable living conditions.",
  },
  {
    icon: "🌊",
    title: "Flooding",
    description:
      "Extreme rainfall and changing weather patterns can increase flood risks and threaten communities.",
  },
  {
    icon: "💧",
    title: "Water Scarcity",
    description:
      "Climate change can affect water availability and make access to clean water more challenging.",
  },
];

const missions = [
  {
    number: "01",
    title: "Promote Sustainable Living",
    description:
      "Encourage people to choose reusable, energy-efficient, and environmentally conscious products.",
  },
  {
    number: "02",
    title: "Support Climate Preparedness",
    description:
      "Provide access to useful products that help people prepare for climate-related challenges.",
  },
  {
    number: "03",
    title: "Build Environmental Awareness",
    description:
      "Introduce practical ways to understand climate change and take responsible actions.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F8F2] text-[#183B2B]">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-[#E5EEDB] px-5 py-2 text-xs font-semibold tracking-widest text-[#527C3E]">
            ABOUT SAFECLIMATE
          </span>

          <h1 className="mt-8 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            A Safer World Starts
            <span className="text-[#76A65B]"> With Us.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-gray-500">
            safeClimate is a sustainable e-commerce platform
            dedicated to helping people prepare for climate
            challenges through practical products and
            environmentally conscious choices.
          </p>

          <Link
            href="/products"
            className="mt-9 inline-block rounded-full bg-[#183B2B] px-8 py-4 font-semibold text-white transition hover:bg-[#28583E]"
          >
            Discover Our Products ↗
          </Link>
        </div>
      </section>

      {/* About Content */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">

          <div>
            <p className="text-sm font-semibold tracking-widest text-[#76A65B]">
              WHO WE ARE
            </p>

            <h2 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
              Preparing for Tomorrow, Starting Today.
            </h2>

            <p className="mt-7 leading-8 text-gray-500">
              Climate change is no longer a distant concern.
              Its effects can be experienced through rising
              temperatures, flooding, and changing weather
              conditions.
            </p>

            <p className="mt-5 leading-8 text-gray-500">
              We believe that preparation and responsible
              consumption are important steps toward building
              more resilient communities. Through safeClimate,
              we bring together practical products that support
              everyday preparedness and sustainable living.
            </p>
          </div>

          <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#DCE9D1] p-8">
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#B6CE9F]" />
            <div className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-[#A2BF86]" />

            <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white/90 p-8 text-center shadow-xl">
              <span className="text-8xl">🌍</span>

              <h3 className="mt-6 text-2xl font-bold">
                One Planet,
                <br />
                One Shared Future.
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                Every responsible choice can contribute
                to a more sustainable future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Climate Challenges */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-widest text-[#76A65B]">
            WHY IT MATTERS
          </p>

          <h2 className="mt-4 text-3xl font-bold md:text-5xl">
            Understanding Climate Challenges.
          </h2>

          <p className="mt-5 leading-8 text-gray-500">
            Climate change creates different challenges
            that require awareness, preparation, and
            responsible environmental actions.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {climateIssues.map((issue) => (
            <article
              key={issue.title}
              className="rounded-3xl border border-[#183B2B]/10 bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5EEDB] text-4xl">
                {issue.icon}
              </div>

              <h3 className="mt-7 text-xl font-bold">
                {issue.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                {issue.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Vision and Mission */}
      <section className="bg-[#183B2B] px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-widest text-[#B6CE9F]">
              OUR PURPOSE
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Our Vision & Mission.
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">

            {/* Vision */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-9">
              <span className="text-4xl">🌱</span>

              <h3 className="mt-6 text-2xl font-bold">
                Our Vision
              </h3>

              <p className="mt-5 leading-8 text-white/70">
                To create a future where people are more
                prepared for climate challenges and actively
                participate in building a sustainable
                environment.
              </p>
            </div>

            {/* Mission */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-9">
              <span className="text-4xl">🎯</span>

              <h3 className="mt-6 text-2xl font-bold">
                Our Mission
              </h3>

              <div className="mt-5 space-y-6">
                {missions.map((mission) => (
                  <div key={mission.number} className="flex gap-4">
                    <span className="text-sm font-bold text-[#B6CE9F]">
                      {mission.number}
                    </span>

                    <div>
                      <h4 className="font-semibold">
                        {mission.title}
                      </h4>

                      <p className="mt-2 text-sm leading-7 text-white/60">
                        {mission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SDG 13 */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">

          <div className="rounded-[2rem] bg-[#DCE9D1] p-10 md:p-14">
            <p className="text-sm font-bold tracking-widest text-[#527C3E]">
              UNITED NATIONS
            </p>

            <div className="mt-8 flex h-48 items-center justify-center rounded-2xl bg-[#3F7E44]">
              <span className="text-8xl">🌍</span>
            </div>

            <h3 className="mt-7 text-2xl font-bold">
              SDG 13: Climate Action
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#527C3E]">
              Take urgent action to combat climate change
              and its impacts.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-widest text-[#76A65B]">
              OUR GLOBAL CONTRIBUTION
            </p>

            <h2 className="mt-5 text-3xl font-bold leading-tight md:text-5xl">
              Aligned With SDG 13.
            </h2>

            <p className="mt-6 leading-8 text-gray-500">
              safeClimate supports the goals of Sustainable
              Development Goal 13 by encouraging climate
              awareness, preparedness, and responsible
              consumption.
            </p>

            <div className="mt-7 space-y-5">
              <div className="flex gap-4">
                <span className="text-xl">✓</span>
                <p className="text-sm leading-7 text-gray-500">
                  Encouraging people to understand climate
                  change and its impacts.
                </p>
              </div>

              <div className="flex gap-4">
                <span className="text-xl">✓</span>
                <p className="text-sm leading-7 text-gray-500">
                  Promoting products that support preparedness
                  and resource efficiency.
                </p>
              </div>

              <div className="flex gap-4">
                <span className="text-xl">✓</span>
                <p className="text-sm leading-7 text-gray-500">
                  Supporting more sustainable everyday choices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#E5EEDB] px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-5xl">
            Make Your Choices Matter.
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            Start exploring practical and sustainable
            products for a safer and greener future.
          </p>

          <Link
            href="/products"
            className="mt-8 inline-block rounded-full bg-[#183B2B] px-8 py-4 font-semibold text-white transition hover:bg-[#28583E]"
          >
            Explore Products ↗
          </Link>
        </div>
      </section>

      <Footer />

    </main>
  );
}
