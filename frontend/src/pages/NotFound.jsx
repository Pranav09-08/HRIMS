function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
      <div>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The route you entered does not exist in this dashboard setup.
        </p>
      </div>
    </div>
  )
}

export default NotFoundPage
