
export default function ImageGallerySection() {
  return (
    <section className="py-24 px-6 bg-[#fcfcfc]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {/* 1st Column */}
          <div className="col-span-1 row-span-2 overflow-hidden rounded-xl">
              <img src="/about-baker.png" alt="Baker dusting flour" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>

          <div className="col-span-1 row-span-2 overflow-hidden rounded-xl bg-black">
              <img src="/bread.png" alt="Loaf of Bread" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          
          {/* 2nd Column - Large Span */}
            <div className="col-span-1 lg:col-span-1 row-span-1 lg:row-span-2 overflow-hidden rounded-xl">
                <div className="h-full flex flex-col gap-4">
                    <div className="flex-1 overflow-hidden rounded-xl">
                        <img src="/croissant.png" alt="Croissants" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 overflow-hidden rounded-xl">
                        <img src="/hero-bg.png" alt="Bread prep" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                </div>
          </div>


          {/* 3rd Column */}
          <div className="col-span-1 row-span-1 overflow-hidden rounded-xl">
                <img src="/about-baker.png" alt="Dark bread" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>

            <div className="col-span-1 row-span-1 lg:col-span-1 lg:row-span-1 overflow-hidden rounded-xl">
                <img src="/cake.png" alt="Chocolate dipped cake" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
            
        </div>
      </div>
    </section>
  );
}
