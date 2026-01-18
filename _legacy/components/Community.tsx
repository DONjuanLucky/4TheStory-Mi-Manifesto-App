
import React from 'react';

const Community: React.FC = () => {
  const trendingBooks = [
    { title: "The Salt of Silence", author: "Elias Vance", genre: "Philosophical Fiction", reads: "12.4k" },
    { title: "Neon Empathy", author: "Sora Kim", genre: "Sci-Fi", reads: "8.1k" },
    { title: "Letters to the Unborn", author: "Mara J.", genre: "Poetry", reads: "4.2k" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h2 className="text-sm font-medium tracking-widest uppercase text-gray-400 mb-2">The Public Shelf</h2>
        <h1 className="font-serif text-5xl">Community</h1>
      </header>

      <div className="space-y-12">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8b7355] mb-6">Trending Manifestos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trendingBooks.map((book, i) => (
              <div key={i} className="group p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-lg transition-all cursor-pointer">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-24 bg-[#8b735520] rounded-lg border border-[#8b735510] flex-shrink-0 flex items-center justify-center font-serif italic text-xl">
                    {book.title[0]}
                  </div>
                  <div>
                    <h4 className="font-serif text-xl group-hover:text-[#8b7355] transition-colors">{book.title}</h4>
                    <p className="text-sm text-gray-500">{book.author}</p>
                    <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                      <span>{book.genre}</span>
                      <span>•</span>
                      <span>{book.reads} reads</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#1a1a1a] p-12 rounded-[3rem] text-white text-center">
          <h3 className="font-serif text-3xl mb-4">Ready to share your whisper?</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-8 font-light leading-relaxed">
            When your manuscript is ready, publish it to the community and inspire other storytellers.
          </p>
          <button className="px-8 py-3 bg-[#8b7355] rounded-full font-medium hover:bg-white hover:text-black transition-all">
            Join the Circle
          </button>
        </section>
      </div>
    </div>
  );
};

export default Community;
