import { cn } from "../utils";

export default function RetroGrid({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute h-full w-full overflow-hidden opacity-40 [perspective:200px] transform-gpu", className)}>
      <div className="absolute inset-0 [transform:rotateX(65deg)] will-change-transform">
        <div
          className={cn(
            "animate-grid will-change-transform [transform:translateZ(0)]",
            "[background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw]",
            "[background-image:linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.15)_1px,transparent_0)]",
            "dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_0)]"
          )}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent to-90% pointer-events-none" />
    </div>
  );
}