export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Cache-Control': 'no-store'
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        const page = url.searchParams.get('page') || 'index';
        const visitor = url.searchParams.get('visitor') || '';
        const counterKey = 'acordesrafa:' + page;

        try {
            let count = parseInt(await env.VISITS.get(counterKey), 10) || 0;

            if (visitor) {
                const seenKey = 'acordesrafa:seen:' + page + ':' + visitor;
                const alreadySeen = await env.VISITS.get(seenKey);
                if (!alreadySeen) {
                    count += 1;
                    await env.VISITS.put(counterKey, String(count));
                    await env.VISITS.put(seenKey, '1');
                }
            }

            return new Response(JSON.stringify({ page, count }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Internal error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};