import React from 'react';
import { Clock, Award, Heart } from 'lucide-react';

export const BannerHero: React.FC = () => {
  return (
    <div className="rounded-3xl bg-amber-100 border border-amber-200 px-6 py-10 sm:px-12 sm:py-14 mb-8">
      <div className="max-w-2xl">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">
          Tito Calderonis · Horneadas del día
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 mb-4 leading-tight">
          El aroma del pan recién horneado, directo a tu mesa.
        </h1>

        <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
          En Tito Calderonis elaboramos con harinas agroecológicas, masa madre cultivada con dedicación, facturas de pura manteca y pastelería tradicional.
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-stone-700 font-medium">
          <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Abierto de 07:00 a 20:30 hs</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-amber-200">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Recetas de familia</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-amber-200">
            <Heart className="w-4 h-4 text-amber-600" />
            <span>Sin conservantes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
