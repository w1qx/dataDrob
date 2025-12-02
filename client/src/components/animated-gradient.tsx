export function AnimatedGradient() {
  return <div
    className="absolute inset-0 opacity-30"
    style={{
      background: `
            radial-gradient(circle at 50% 50%, 
              hsl(195, 85%, 45%) 0%, 
              hsl(200, 50%, 90%) 25%, 
              transparent 50%
            ),
            radial-gradient(circle at 0% 0%, 
              hsl(195, 85%, 80%) 0%, 
              transparent 50%
            ),
            radial-gradient(circle at 100% 100%, 
              hsl(200, 50%, 80%) 0%, 
              transparent 50%
            )
          `,
      filter: "blur(60px)",
    }}
    aria-hidden="true"
  />;
}
