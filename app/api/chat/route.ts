import { google } from '@ai-sdk/google';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

function parseSleepData() {
    // Import the sleep data (you'll need to import this JSON file)
    const sleepData = require('@/garmin/sebastian/DI_CONNECT/DI-Connect-Wellness/2025-04-13_2025-07-22_129258466_sleepData.json');
    
    const sleepScores = sleepData
      .filter((entry: any) => entry.sleepScores && entry.calendarDate) // Filter out entries without sleep scores
      .map((entry: any) => ({
        date: entry.calendarDate,
        overallScore: entry.sleepScores.overallScore,
        qualityScore: entry.sleepScores.qualityScore,
        durationScore: entry.sleepScores.durationScore,
        recoveryScore: entry.sleepScores.recoveryScore,
        feedback: entry.sleepScores.feedback,
        insight: entry.sleepScores.insight
      }))
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
    
    return sleepScores;
  }

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const supabase = await createClient();

  // Get the last user message
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.parts[0]?.type === 'text' ? lastMessage.parts[0].text : '';   

    // Check if the user is asking about workouts
    if (userQuery.toLowerCase().includes('workout') || 
        userQuery.toLowerCase().includes('exercise') ||
        userQuery.toLowerCase().includes('training')) {
        
        try {
            // Query Supabase for workout data
            const { data: workouts, error } = await supabase
                .from('WORKOUTS')
                .select(`
                *,
                STEPS (
                    *,
                    EXERCISES (*)
                )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Create a context message with workout data
            const workoutContext = `Here's your workout information:\n${JSON.stringify(workouts, null, 2)}`;
            
            // Add the context to the conversation
            const messagesWithContext = [
                {
                    id: 'context',
                    role: 'system' as const,
                    parts: [{ type: 'text' as const, text: `You are a helpful fitness assistant. Use this workout data to answer questions: ${workoutContext}` }]
                },
                ...messages
            ];

            const prompt = convertToModelMessages(messagesWithContext);

            const result = streamText({
                model: google('gemini-2.0-flash'),
                prompt,
            });

            return result.toUIMessageStreamResponse();
        } catch (error) {
            console.error('Supabase error:', error);
        // Fall back to regular chat if there's an error
        }
    }

    else if (userQuery.toLowerCase().includes('sleep')) {
        try {
            const sleepScores = parseSleepData();

            const formattedSleepData = sleepScores.map((score: { date: any; overallScore: any; }) => 
                `Date: ${score.date} | Overall Score: ${score.overallScore}/100`
            ).join('\n');

            const sleepSummary = `Here's your sleep data:\n\n${formattedSleepData}\n\nTotal entries: ${sleepScores.length}`;
            
            const messagesWithContext = [
                {
                    id: 'context',
                    role: 'system' as const,
                    parts: [{ type: 'text' as const, text: `You are a helpful fitness assistant. Use this sleep data to answer questions: ${sleepSummary}` }]
                },
                ...messages
            ];

            const prompt = convertToModelMessages(messagesWithContext);

            const result = streamText({
                model: google('gemini-2.0-flash'),
                prompt,
            })

            return result.toUIMessageStreamResponse();
        } catch (error) {
            console.error('Supabase error:', error);
        // Fall back to regular chat if there's an error
        }
    }

    // Regular chat flow
    const prompt = convertToModelMessages(messages);

    const result = streamText({
        model: google('gemini-2.0-flash'),
        prompt,
    });

    return result.toUIMessageStreamResponse();
}