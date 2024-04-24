import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

import { api } from "~/utils/api";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

import { type EventWithImages } from "~/server/api/routers/event";
import HeaderDefault from "~/components/HeaderDefault";
import Head from "next/head";

const DEFAULT_EVENT: EventWithImages = {
  id: 0,
  name: "Event Name",
  description: "Event Description",
  images: [
    {
      id: 0,
      deleted: false,
      path: "/images/dummies/event/event1.png",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  status: "DRAFT",
  createdAt: new Date(),
  createdById: 1,
  updatedAt: new Date(),
};

export default function Home() {
  const { data: events } = api.event.getFront.useQuery({
    limit: 6,
    page: 1,
  });
  const { data: partners } = api.partner.get.useQuery();

  const [eventHero, setEventHero] = useState(DEFAULT_EVENT.images.map((image) => image.path));

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const eventImages = events?.data.reduce((carry: string[], event: EventWithImages) => {
      return [...carry, ...event.images.map((image) => image.path)];
    }, [] as string[]) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setEventHero(eventImages);
  }, [events]);

  return (
    <>
      <Head>
        <title>UTOPIA - NFT</title>
      </Head>
      <HeaderDefault/>
      <main className="w-full overflow-hidden">
        <section className="relative min-h-screen">
          <Carousel className="h-screen w-full">
            <CarouselContent className="ml-0 h-screen w-full">
              {
                eventHero.map((image, index) => (
                <CarouselItem key={index} className="pl-0">
                  <div className="relative h-full w-full">
                    <Image
                      className="object-cover"
                      alt="Hero Event"
                      src={image}
                      fill
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-10 z-10" />
            <CarouselNext className="absolute right-10 z-10" />
          </Carousel>
          <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-8 text-center">
            <h1 className="max-w-xl text-7xl font-extrabold text-white">
              WELCOME TO{" "}
              <span className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-transparent">
                UTOPIA
              </span>{" "}
              FAMILY
            </h1>
            <p className="max-w-md text-lg text-white">
              Utopia NFT club is an exclusive close-knit community a melting pot
              of influential people in Indonesia’s NFT scene
            </p>
            <Link href="https://opensea.io/collection/utopia-club" target="_blank">
              <button className="h-14 w-40 rounded-full bg-gradient-to-b from-utopia-blue to-utopia-yellow text-lg font-bold shadow-lg transition hover:shadow">
                OpenSea
              </button>
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 top-0 z-0 bg-gradient-to-t from-utopia-dark-grey to-transparent"></div>
        </section>
        <section className="relative flex min-h-screen flex-col gap-8 bg-utopia-dark-grey p-12 md:p-20 lg:p-12 xl:p-20">
          <div className="mx-auto w-full max-w-7xl">
            <div className="text-center">
              <h2 className="text-center text-6xl font-bold text-white">
                <span className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-transparent">
                  UTOPIA
                </span>{" "}
                EVENTS
              </h2>
              <p className="mt-3 text-lg text-white">
                Current ongoing events - you can also be a part of!
              </p>
            </div>
            <div className="mt-12 grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {
                (events?.data ?? [])
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                .map((event, index) => (
                <div
                  key={index}
                  className="relative h-80 overflow-hidden p-1 before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:bg-gradient-to-b before:from-utopia-blue before:to-utopia-yellow before:transition before:duration-300  before:hover:rotate-180"
                >
                  <div className="group relative h-full overflow-hidden bg-utopia-dark-grey p-2">
                    <Image
                      className="object-contain"
                      src={event.images[0]?.path ?? ""}
                      alt={`Images of ${event.name}'s Event`}
                      fill
                    />
                    <p className="absolute bottom-4 right-4 z-10 text-3xl text-white transition group-hover:opacity-0">
                      {event.name}
                    </p>
                    <div className="absolute -bottom-full left-0 right-0 bg-utopia-dark-grey/[0.7] p-3 transition group-hover:bottom-0">
                      <p className="text-lg font-bold text-white">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center h-32 mt-8">
              <Link href="/events" className="p-2">
                <p className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-4xl font-bold text-transparent">
                  VIEW ALL
                </p>
              </Link>
            </div>
          </div>
          <Image
            className="absolute bottom-0 left-0 opacity-0 xl:opacity-100"
            src="/images/decor-arrow-gradient.svg"
            alt="decor arrow"
            width="140"
            height="400"
          />
          <Image
            className="absolute right-0 top-0 -scale-x-100 -scale-y-100 opacity-0 xl:opacity-100"
            src="/images/decor-arrow-gradient.svg"
            alt="decor arrow"
            width="140"
            height="400"
          />
        </section>
        <section className="min-h-screen bg-black p-12 md:p-20">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
            <div className="py-6">
              <h2 className="text-center text-6xl font-semibold text-white">
                ABOUT{" "}
                <span className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-transparent">
                  UTOPIA
                </span>
              </h2>
              <p className="pt-8 text-center text-3xl text-white xl:px-28">
                Utopia club is an exclusive close-knit community and foundation,
                a melt-ing pot of influential people in Indonesia’s web3.0 scene
                with various backgrounds: from degens to investors, celebrities
                to entrepreneurs, and web2 to web3 professionals that connect to
                conventional brands and global web3 projects.
                <br />
                <br />
                Embracing the nature of decentralization, we operate in
                holacracy management where every contributing working group has
                a self-organizing system and a decision made by activism with
                non-hierarchy, consensus, and collectivism values.
              </p>
            </div>
            <div className="px-8">
              <div className="h-1.5 w-full rounded bg-gradient-to-br from-utopia-blue to-utopia-yellow"></div>
            </div>
            <div className="py-6">
              <h2 className="text-center text-6xl font-semibold text-white">
                <span className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-transparent">
                  UTOPIA
                </span>{" "}
                CAPITALS
              </h2>
              <div className="grid grid-cols-1 gap-8 pt-12 md:grid-cols-2 xl:grid-cols-4">
                <button className="relative h-56 bg-gradient-to-b from-utopia-blue to-utopia-yellow p-1">
                  <div className="group relative h-full w-full bg-black">
                    <p className="absolute bottom-2 left-1/2 right-2 top-1/2 h-max w-full -translate-x-1/2 -translate-y-1/2 p-3 text-center text-4xl font-bold text-white opacity-100 transition group-hover:opacity-0">
                      Economical Capital
                    </p>
                    <p className="absolute bottom-2 left-1/2 right-2 top-1/2 h-max w-full -translate-x-1/2 -translate-y-1/2 p-3 text-center text-4xl font-bold text-white opacity-0 transition group-hover:opacity-100">
                      Economical Capital
                    </p>
                  </div>
                </button>
                <button className="relative h-56 bg-gradient-to-b from-utopia-blue to-utopia-yellow p-1">
                  <div className="group relative h-full w-full bg-black">
                    <p className="absolute bottom-2 left-1/2 right-2 top-1/2 h-max w-full -translate-x-1/2 -translate-y-1/2 p-3 text-center text-4xl font-bold text-white opacity-100 transition group-hover:opacity-0">
                      Social Capital
                    </p>
                    <p className="absolute bottom-2 left-1/2 right-2 top-1/2 h-max w-full -translate-x-1/2 -translate-y-1/2 p-3 text-center text-4xl font-bold text-white opacity-0 transition group-hover:opacity-100">
                      Social Capital
                    </p>
                  </div>
                </button>
                <button className="relative h-56 bg-gradient-to-b from-utopia-blue to-utopia-yellow p-1">
                  <div className="group relative h-full w-full bg-black">
                    <p className="absolute bottom-2 left-1/2 right-2 top-1/2 h-max w-full -translate-x-1/2 -translate-y-1/2 p-3 text-center text-4xl font-bold text-white opacity-100 transition group-hover:opacity-0">
                      Cultural Capital
                    </p>
                    <p className="absolute bottom-2 left-1/2 right-2 top-1/2 h-max w-full -translate-x-1/2 -translate-y-1/2 p-3 text-center text-4xl font-bold text-white opacity-0 transition group-hover:opacity-100">
                      Cultural Capital
                    </p>
                  </div>
                </button>
                <button className="relative h-56 bg-gradient-to-b from-utopia-blue to-utopia-yellow p-1">
                  <div className="group relative h-full w-full bg-black">
                    <p className="absolute bottom-2 left-1/2 right-2 top-1/2 h-max w-full -translate-x-1/2 -translate-y-1/2 p-3 text-center text-4xl font-bold text-white opacity-100 transition group-hover:opacity-0">
                      Symbolic Capital
                    </p>
                    <p className="absolute bottom-2 left-1/2 right-2 top-1/2 h-max w-full -translate-x-1/2 -translate-y-1/2 p-3 text-center text-4xl font-bold text-white opacity-0 transition group-hover:opacity-100">
                      Symbolic Capital
                    </p>
                  </div>
                </button>
              </div>
            </div>
            <div className="py-6">
              <h2 className="text-center text-6xl font-semibold text-white">
                <span className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-transparent">
                  UTOPIA
                </span>{" "}
                VALUES
              </h2>
              <div className="grid grid-cols-1 gap-8 pt-12 md:grid-cols-2 xl:grid-cols-4">
                <button className="relative h-56 bg-gradient-to-b from-utopia-blue to-utopia-yellow p-1">
                  <div className="group relative h-full w-full bg-black">
                    <div className="absolute bottom-2 left-2 right-2 top-2 flex flex-col items-center justify-center">
                      <Image
                        src="/images/logo-utopia-white.png"
                        alt="icon value"
                        width="80"
                        height="80"
                      />
                      <p className="p-2 text-2xl font-bold text-white">
                        Collectivism
                      </p>
                    </div>
                  </div>
                </button>
                <button className="relative h-56 bg-gradient-to-b from-utopia-blue to-utopia-yellow p-1">
                  <div className="group relative h-full w-full bg-black">
                    <div className="absolute bottom-2 left-2 right-2 top-2 flex flex-col items-center justify-center">
                      <Image
                        src="/images/logo-utopia-white.png"
                        alt="icon value"
                        width="80"
                        height="80"
                      />
                      <p className="p-2 text-2xl font-bold text-white">
                        Learning
                      </p>
                    </div>
                  </div>
                </button>
                <button className="relative h-56 bg-gradient-to-b from-utopia-blue to-utopia-yellow p-1">
                  <div className="group relative h-full w-full bg-black">
                    <div className="absolute bottom-2 left-2 right-2 top-2 flex flex-col items-center justify-center">
                      <Image
                        src="/images/logo-utopia-white.png"
                        alt="icon value"
                        width="80"
                        height="80"
                      />
                      <p className="p-2 text-2xl font-bold text-white">
                        Kaizen
                      </p>
                    </div>
                  </div>
                </button>
                <button className="relative h-56 bg-gradient-to-b from-utopia-blue to-utopia-yellow p-1">
                  <div className="group relative h-full w-full bg-black">
                    <div className="absolute bottom-2 left-2 right-2 top-2 flex flex-col items-center justify-center">
                      <Image
                        src="/images/logo-utopia-white.png"
                        alt="icon value"
                        width="80"
                        height="80"
                      />
                      <p className="p-2 text-2xl font-bold text-white">
                        Mutual Respect
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="bg-utopia-dark-grey p-12 md:p-20">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
            <div className="grid grid-cols-2 place-items-center md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <div className="">
                <p className="text-lg font-semibold text-white">
                  Supported By:
                </p>
              </div>
              {partners?.map((partner, index) => (
                <div key={index} className="relative h-20 w-full">
                  <Link href={partner.description ?? "#"} target="_blank"><Image
                      className="object-contain"
                      src={partner.images[0]?.path ?? ""}
                      alt={`Logo ${partner.name}`}
                      fill
                  /></Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-black p-12 md:p-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex flex-wrap gap-8">
            <div className="flex flex-wrap gap-8 2xl:flex-1">
              <div className="relative h-24 w-24 lg:h-40 lg:w-40">
                <Image src="/images/logo-utopia.png" alt="Logo Utopia" fill />
              </div>
              <div className="flex flex-col gap-8 lg:flex-1">
                <h3 className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-3xl font-bold text-transparent">
                  UTOPIA FAMILY
                </h3>
                <p className="text-2xl text-white">
                  We aim to be the most respectful and influential web3
                  community in Asia. The melting pot of the best talent and
                  network in the space where collaborations are made, and one of
                  the leading web3 foundations.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-8 xl:py-0 2xl:flex-1">
              <div>
                <h3 className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-4xl font-bold text-transparent">
                  MORE ABOUT US
                </h3>
                <p className="break-all pt-2 text-4xl font-bold text-white">
                  COMPANY PROFILE
                </p>
              </div>
              <div>
                <h3 className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-4xl font-bold text-transparent">
                  CONTACT US
                </h3>
                <p className="break-all pt-2 text-4xl font-bold text-white">
                  INFO@UTOPIANFT.CLUB
                </p>
              </div>
            </div>
            <div>
              <h3 className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-4xl font-bold text-transparent">
                SOCIALS
              </h3>
              <div className="flex items-center gap-8 pt-2">
                <a href="https://instagram.com/utopiaclub_" target="_blank">
                  <Image
                    src="/images/social/social-ig-white.png"
                    alt="icon instagram"
                    height="40"
                    width="40"
                  />
                </a>
                <a href="https://twitter.com/utopiaclub_" target="_blank">
                  <Image
                    src="/images/social/social-x-white.png"
                    alt="icon instagram"
                    height="40"
                    width="40"
                  />
                </a>
                <a href="https://utopianft.club" target="_blank">
                  <Image
                    src="/images/social/social-discord-white.png"
                    alt="icon instagram"
                    height="40"
                    width="40"
                  />
                </a>
              </div>
            </div>
          </div>
          <p className="py-8 text-right text-2xl text-white">
            COPYRIGHT UTOPIA FAMILY © ALL RIGHTS RESERVED 2023
          </p>
        </div>
      </footer>
    </>
  );
}
