"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Users, Heart, Star, Award } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
export default function QuienesSomosPage() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 font-amiko">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              {t("Sobre Furgocasa")}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
              {t("Pasión por viajar, libertad para explorar")}
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg text-gray-600 leading-relaxed mx-auto text-center mb-16">
                <p className="text-2xl font-medium text-gray-800 mb-8">
                  {t("Somos una empresa familiar nacida de la pasión por el mundo camper y las ganas de compartir esa libertad con los demás.")}
                </p>
                <p>
                  {t("En Furgocasa, no solo alquilamos vehículos; ofrecemos experiencias. Entendemos que cada viaje es único y personal, por eso cuidamos cada detalle para que tu única preocupación sea disfrutar del camino.")}
                </p>
                <p>
                  {t("Nuestra flota está compuesta por vehículos modernos, seguros y equipados con todo lo necesario para que te sientas como en casa, estés donde estés.")}
                </p>
              </div>

              {/* Values */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-furgocasa-blue">
                    <Heart className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">{t("Pasión")}</h3>
                  <p className="text-sm">{t("Amamos lo que hacemos y eso se nota en el cuidado de nuestros vehículos y el trato al cliente.")}</p>
                </div>
                
                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 text-furgocasa-orange">
                    <Star className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">{t("Calidad")}</h3>
                  <p className="text-sm">{t("Solo trabajamos con las mejores marcas y mantenemos nuestra flota en perfecto estado.")}</p>
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">{t("Cercanía")}</h3>
                  <p className="text-sm">{t("Te acompañamos antes, durante y después de tu viaje. Somos tu copiloto de confianza.")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-24 bg-furgocasa-blue text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl font-heading font-bold mb-2">10+</p>
                <p className="text-blue-200 uppercase tracking-widest text-sm">{t("Años de experiencia")}</p>
              </div>
              <div>
                <p className="text-5xl font-heading font-bold mb-2">500+</p>
                <p className="text-blue-200 uppercase tracking-widest text-sm">{t("Viajes realizados")}</p>
              </div>
              <div>
                <p className="text-5xl font-heading font-bold mb-2">15</p>
                <p className="text-blue-200 uppercase tracking-widest text-sm">{t("Vehículos Premium")}</p>
              </div>
              <div>
                <p className="text-5xl font-heading font-bold mb-2">4.9</p>
                <p className="text-blue-200 uppercase tracking-widest text-sm">{t("Valoración Media")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
