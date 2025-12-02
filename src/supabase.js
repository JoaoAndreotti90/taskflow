import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibmungrysvgstntvtkxn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibXVuZ3J5c3Znc3RudHZ0a3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDg0NDcsImV4cCI6MjA4MDE4NDQ0N30.ioJx4fbfD0dx0FoBSgvbK7k67Xkt8-8AN1484MLjgE8'

export const supabase = createClient(supabaseUrl, supabaseKey)