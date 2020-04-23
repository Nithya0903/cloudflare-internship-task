/*
implemented by: Nithya Manoj
contact info  : nithyamanoj.ms@gmail.com
Created as a part of cloudflare workers internship challenge
All the requirements and bonustasks except publishing to a domain is completed
it is deployed at: https://task.worker01.workers.dev
*/
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})


class contentReplacer {
    constructor(content) {
        this.content = content;
    }
    element(element) {
        element.setInnerContent(this.content);
    }
}



const gh = "https://github.com/Nithya0903";
class attributeReplacer {
    element(element) {
        element.setAttribute("href", gh);
    }
}


/**
 * Respond with hello worker text
@param {Request} request
 *
 */


async function handleRequest(request) {
    let cookies;
    if (request.headers.has('Cookie')) {
        cookies = request.headers.get('Cookie'); //if the user have visited a version before cookies is used to store the version no
        if (cookies.includes("variant=0"))
            cookies = 0;
        else
            cookies = 1;
    } else cookies = -1;

    let urls = []
    await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
        .then(function(res) {
            return res.json()
        })
        .then(function(data) {
            urls.push(data.variants[0]);
            urls.push(data.variants[1]);
        });
    if (cookies == -1) { //if there is no Cookies, choosing 0 or 1 randomly so that there is equal probability
        no = Math.random();
        no = no * 2;
        no = Math.floor(no);
    } else
        no = cookies;

    // Changing  URL to the required page
    let url = urls[no];
    const newRequest = new Request(url)

    try {
        const response = await fetch(newRequest);
        const rewriter = new HTMLRewriter();

        rewriter.on('title', new contentReplacer("Nithya's workers project"));
        rewriter.on("p#description", new contentReplacer("Hi, I am Nithya.This was developed for cloudflare internship task "));
        rewriter.on("a#url", new contentReplacer("Click to visit my github profile"));
        rewriter.on("a#url", new attributeReplacer());
        if (no == 0) {
            rewriter.on("h1#title", new contentReplacer("First variant page!!"));
        } else {
            rewriter.on("h1#title", new contentReplacer("Second variant page!!"));
        }
        const newResponse = rewriter.transform(response);
        newResponse.headers.set("Set-Cookie", `variant=${no}`);
        return newResponse;

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message}), {status: 500})
    }

};
