export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-center mb-4">
        LocalContent.ai
      </h1>
      <p className="text-xl text-muted-foreground text-center mb-8">
        AI-Powered Content for Local Businesses
      </p>
      <div className="flex gap-4">
        <a 
          href="/login" 
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Login
        </a>
        <a 
          href="/signup" 
          className="px-6 py-3 border border-input rounded-md hover:bg-accent"
        >
          Sign Up
        
        </a>
      </div>
    </main>
  )
}