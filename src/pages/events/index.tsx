import Image from "next/image";
import HeaderDefault from "~/components/HeaderDefault";
import { EventWithImages } from "~/server/api/routers/event";
import { api } from "~/utils/api";

export default function Event() {
    const { data: eventData, hasNextPage, isFetchingNextPage, fetchNextPage, } = api.event.getFront.useInfiniteQuery(
        { limit: 6 },
        { getNextPageParam: (lastPage) => lastPage.next_page }
    );
    const events = eventData?.pages.flat().reduce((carry, event) => [...carry, ...event.data], [] as EventWithImages[]) ?? [];

    const handleScroll = (event: React.UIEvent<HTMLElement>) => {
        console.log()
        console.log(event.currentTarget.scrollTop);
    }
    return (
        <>
            <HeaderDefault />
            <main className="relative bg-utopia-dark-grey min-h-screen p-20 overflow-hidden">
                <div className="mx-auto w-full max-w-7xl overflow-auto" onScroll={handleScroll}>
                    <h2 className="text-center text-6xl font-bold text-white">
                        <span className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-transparent">UTOPIA</span>
                        EVENTS
                    </h2>
                    <p className="mt-3 text-lg text-center text-white">
                        All of the current ongoing and past events - you can also be a part of or reminiscing!
                    </p>
                    <div className="mt-12 grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {
                        events.map((event, index) => (
                        <div
                            key={index}
                            className="relative h-80 overflow-hidden p-1 before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:bg-gradient-to-b before:from-utopia-blue before:to-utopia-yellow before:transition before:duration-300  before:hover:rotate-180">
                            <div className="group relative h-full overflow-hidden bg-utopia-dark-grey p-2">
                                <Image
                                    className="object-contain"
                                    src={event.images[0]?.path ?? ""}
                                    alt={`Images of ${event.name}'s Event`}
                                    fill
                                    sizes="100%"
                                />
                                <p className="absolute bottom-4 right-4 z-10 text-3xl text-white transition group-hover:opacity-0">{event.name}</p>
                                <div className="absolute -bottom-full left-0 right-0 bg-utopia-dark-grey/[0.7] p-3 transition group-hover:bottom-0">
                                    <p className="text-lg font-bold text-white">{event.description}</p>
                                </div>
                            </div>
                        </div>
                        ))
                    }
                    </div>
                    <div className="mt-12">
                        {
                            hasNextPage && (
                            <button className="block mx-auto p-2" onClick={() => fetchNextPage()}>
                                <p className="bg-gradient-to-b from-utopia-blue to-utopia-yellow bg-clip-text text-4xl font-bold text-transparent">VIEW MORE</p>
                            </button>
                            )
                        }
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
            </main>
        </>
    )
}