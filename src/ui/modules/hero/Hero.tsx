import type React from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Img } from "@/ui/Img"

import CTAList from "@/ui/CTAList"
import Pretitle from "@/ui/Pretitle"
import { stegaClean } from "next-sanity"

export default function Hero(props: Sanity.Hero & { className?: string; isTabbedModule?: boolean }) {
  const { className, isTabbedModule = false } = props;

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30", 
        !isTabbedModule && "py-24 md:py-32 lg:py-40",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 blur-3xl opacity-70 dark:from-rose-500/10 dark:to-purple-500/10"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 blur-3xl opacity-70 dark:from-blue-500/10 dark:to-cyan-500/10"></div>
      </div>

      <div className="container relative z-10 px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col max-w-3xl">
            {props.pretitle && (
              <Pretitle className="mb-6">{props.pretitle}</Pretitle>
            )}
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {props.highlightedTitle ? (
                <>
                  <span className="inline-block mb-2 bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent dark:text-rose-400 font-extrabold">
                    {props.highlightedTitle}
                  </span>{" "}
                  <br />
                </>
              ) : null}
              <span>{props.title}</span>
            </h1>

            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">{props.description}</p>

            {/* Call-to-actions section */}
            {props.ctas && props.ctas.length > 0 && (
              <div className="mt-10">
                <CTAList 
                  className="flex flex-col sm:flex-row gap-4" 
                  ctas={stegaClean(props.ctas)} 
                />
              </div>
            )}
          </div>

          {props.image && (
            <div className="relative lg:ml-auto">
              <div className="relative z-10 overflow-hidden rounded-2xl shadow-2xl">
                <div className="aspect-[4/3] md:aspect-[16/9] bg-gradient-to-br from-gray-900 to-gray-800">
                  <Img 
                    image={props.image.image}
                    className="w-full h-full object-cover" 
                    alt={props.image.alt || props.image.image?.alt || "Hero image"}
                  />
                </div>
              </div>

              {/* Image decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-rose-600/30 blur-xl"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-purple-600/20 blur-xl"></div>

              {/* Decorative pattern */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-rose-600/20 to-transparent rounded-tl-3xl"></div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 