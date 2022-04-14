import Link from "next/link";

const XYProjectsTwo = () => {
  const posts = [
    {
      title: 'X,Y Project (Genesis)',
      href: 'https://opensea.io/collection/xy-coordinates',
      description:
        "A set of 16,384 NFT plots (X,Y Coordinates) stored on-chain, creating a 128x128 GRID. Owners get exclusive access to games, future NFTs & digital land in X,Y World.",
      imageUrl:
        'https://openseauserdata.com/files/980ed80888257c4f61f6521f5c93f309.svg',
    },
    {
      title: 'X,Y Squad',
      href: '#',
      description:
        'Coming Soon! A set of collectible NFT avatars with unique attributes that can be used in-game, starting with X,Y World. FREE mint exclusively for X,Y Project owners.',
      imageUrl:
        '/images/xysquad.png',
    },
    {
      title: 'X,Y World',
      href: 'https://nftworlds.com/play',
      description:
        'An open world metaverse game built on X,Y Project & NFT Worlds. Land within the game is divided into a 128x128 grid. X,Y owners get exclusive rights to build on the land.',
      imageUrl:
        '/images/xyworld.png',
    },
  ]

  return (
    <div className="relative pt-4 pb-1 px-4 sm:px-6 lg:pt-6 lg:pb-2 lg:px-8">
      <div className="absolute inset-0">
        <div className="h-1/3 sm:h-2/3" />
      </div>
      <div className="relative max-w-7xl mx-auto">
        <div className="mt-6 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
          {posts.map((post) => (
            <div key={post.title} className="flex flex-col overflow-hidden">
              <div className="flex-shrink-0">
                <img className="h-48 w-full object-cover rounded-lg" src={post.imageUrl} alt="" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-xl font-semibold"><Link href={post.href} className="block mt-2">{post.title}</Link></p>
                  <p className="mt-3 text-base text-white">{post.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default XYProjectsTwo;
