const httpStatus = require('http-status')
const PitchDeckService = require('../services/Sequelize/PitchDeckService')
const { createChatCompletion, generateImages } = require('../scripts/helpers/openaiHelper')
const { SuccessResult, SuccessDataResult, ErrorResult, ErrorDataResult } = require('../scripts/utils/results')
const { decodeToken } = require('../scripts/helpers/hashHelper')
const { AuthError } = require('../scripts/utils/Errors')
const { json } = require('sequelize')
require('express-async-errors')

class PitchDeckController {
    async getAll(req, res) {
        const data = await PitchDeckService.getAll()
        res.status(200).json(new SuccessDataResult(null, data))
    }

    async getChat(req, res){
        const data = req.body
        const answer = await createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
              {
                "role": "system",
                "You are an assistant of a company called Brif. This company is making pitch decks with the help of AI. Users are answering 10 questions and the answers are used to create and analyze the company that is answering and want to create a pitch deck. companies might have trouble with some of the questions because they might not know some of the terms. When they have questions, they will come to you to answer their questions. Your duty is answering users' questions clear, short, and simple. You can not answer questions that are out of context. For example, if someone asks the president of the USA; you can not answer this. you should say ‘this question is out of the context, i can not assist with that kind of questions please ask me about business, pitch decks, economics, marketplace, target customers, problems around the world, solutions, metrics, time planning topics. etc.’ as an answer to those kinds of regular questions. your duty is not answering regular questions. It must be about business, pitch decks, economics, marketplace, target customers, problems around the world, solutions, metrics, time planning etc."
              },
              {
                "role": "user",
                "content": '${data.quesiton}'
              }
            ],
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          })
        res.status(200).json(new SuccessDataResult(null, answer))
    }

    async getById(req, res) {
        const data = await PitchDeckService.getById(req.params.id)
        res.status(200).json(new SuccessDataResult(null, data))
    }

    async getByUserId(req, res) {
        const userId = decodeToken(req.headers.authorization.split(' ')[1]).id
        const data = await PitchDeckService.getFiltered({userId:userId})
        res.status(200).json(new SuccessDataResult(null, data))
    }

    async generatePitchDeck(req, res) {
        const userId = decodeToken(req.headers.authorization.split(' ')[1]).id
        const responses = req.body
        const pitchDeckInformation = await getPitchDeckInformations(responses)
        const pitchDeckSlides = await generatePitchDeckSlides(pitchDeckInformation, responses)
        const pitchDeck = {
            "user-id":`${userId}`,
            "template":"pitch-deck",
            "slides":pitchDeckSlides
        }
        const pitchDeckJson = JSON.stringify(pitchDeck)
        const picthDeckForAdd = {userId:userId, meta:pitchDeckJson}
        const addedPitchDeck = await PitchDeckService.add(picthDeckForAdd)
        res.status(200).json(new SuccessDataResult(null, addedPitchDeck))
    }

    async createImages(req, res) {
        const data = await generateImages({
            prompt: "A cute baby sea otter",
            n: 1,
            size: "1024x1024",
        })
        res.status(200).json(new SuccessDataResult(null, data))
    }
}


const getPitchDeckInformations = async (responses) => {
    const companyAnalyzer = await createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            "role": "system",
            "content": "you are a company analyzer. a company answers some of the questions that are shown as down blow. \n\nquestions:\n{\nQuestion 1: Who are you?\nDetails:\nProvide your name surname title & project / startup name and contact details like e-mail and phone number.\nCanvas: #Startupname #date\n\nQuestion 2: What is problem?\nDetails:\nDescribe the pain: what are the top 3 problems that your (potential) customers have?\nCanvas #problem1 #problem1sentence #problem2 #problemsentence #problem3 #problem3sentence\n\nQuestion 3: What is your solution?\nDetails:\nDescribe the satisfaction: what are the top 3 features of your product that will solve customers problems (one solution for each problem)\nCanvas: #solution1 #solution1 sentence #solution2\n‡solution? sentence #solution3 #solution3sentence\n\nQuestion 4: What is value proposition?\nDetails:\nExplain the value of the solution and/or the value of satisfaction you provide.\nSimple, clear, compelling message that states why you are different and worth paying attention.\nCanvas: #change #enhance #improve #better #upgrade #reform\n\nQuestion 5: What is underlying magic?\nDetails:\nDescribe the technology, formula, unfair advantage, magic behind product.\nWhy can't be easily copied? (your secret sauce)\n* You can add 3 steps if needed)\nCanvas: #technology #shockingfact #formula #magic #advantage #step1 #step2 #step3\n\nQuestion 6: Who are target customers?\nDetails:\nExplain who are ready to buy your product. Name your target customers and users.\nCanvas: #customers #users #segment #product #service\n\nQuestion 7: Explain go-to-market plan.\nDetails:\nHow will you reach customers?\nTell about early adopters; activities and strategies.\nCanvas: #gotomarket #plan #strategy #marketing #selling #distribution #channels #earlyadopters\n\nQuestion 8: What are cost metrics?\nKey costs which are needed to produce and sell, like: HW, SW, CAC, distribution costs, hosting, people etc.\nCanvas: #KPI #keymetrics #cost #cac #unitcost #retentioncosts\n#hwcost #swcost #servicecost #peoplecost #hostingcost\n#distrubitioncost\n\nQuestion 9: What are revenue metrics?\nDetails:\nKey revenue metrics; how many\ncustomers you can reach, how many sales you can make, how much revenue you can create, CLTV etc, separately.\n\nQuestion10:What is the timeplan?\nDetails:\nExplain the current status and next steps\n}\n\nand you should extract the personas/characteristics of that company. these will be used for pitch decks you can extract sector, vision/mission, presentation language style, target costumers and To whom will they make the presentation etc.\n\nUser dont have to write the question heading that was aswered. "
          },
          {
            "role": "user",
            "content": "Hello, I am Görkem Yağcı, I have been the CEO of our startup Mercury.Tech since 2023. Our startup's email address is ertugrultunc38@gmail.com, phone number is 05432308084.\nOur 1. problem is that people cannot find a team, job, freelancer job they feel they belong to, either paid or unpaid.\nOur second problem is that the teams and people who want to develop their own business do not have anyone to help them in the job position they are looking for. So if you don't have money, you can't find people to trade your workforce.\nOur third problem is that the exchanged workforce does not have the ground to cooperate later in a suitable and reliable environment. In other words, there is no precaution against fraudsters who will exploit the workforce.\nThe solution is very simple, first of all, create a safe environment where people can safely share their workforce and not exploit each other's rights. Then, designing and adjusting the system according to each business category, and finally, making each other's work and doing the work they want with their own field of expertise and making them use the labor exchange instead of money. We call this swap a match.\nOur difference is that we do not force people to financially when they want to develop a business. If you are a resourceful and intelligent person, you can buy a job by giving money with what you can do. Here, both sides proceed in line with their own interests. For example, if a plumber wants to build a website for himself, he does the plumbing in response to the plumbing needs of a software developer and gets a website in return. We bring those in need together with the workforce, not money.\nOur technology is our algorithm. In the face of an algorithm that develops and learns as a result of determining who needs what and who needs what and who is doing what with the information obtained in advance, we always direct whoever needs what to the needs of the appropriate people or inform them through the notification method.\nWe bring together people who do not want to spend a lot of money, but who want to grow by working constantly.\nWe want to ensure that we remain partners or brokers in these paid business plans by always being in favor of cooperation in our market plan and growth target, by ensuring that people who have done business together continue in their workforce and do new jobs, and by having paid business plans set up.\nOur first office was opened in the first quarter of 2023 and we want to make our first investment in the second quarter of 2023 and upgrade the mvp version to pro in the third quarter of 2023."
          },
          {
            "role": "assistant",
            "content": "- Industry: Freelancing/Job marketplace\n- Sector: Workforce management/Job matching\n- Vision: To create a safe and reliable platform for people to exchange their skills and services without relying on traditional monetary transactions\n- Mission: Assist individuals and teams in finding a suitable workforce or job position, fostering cooperation and growth opportunities\n- Presentation language style: Informative, practical, and focused on the benefits of a non-monetary labor exchange system and a little bit of fun cause of human relations.\n- Target customers: Individuals and teams looking for a job or workforce, particularly those who want to develop their own business or trade their skills\n- Target presentation viewers: Investors, potential partners or clients who are interested in supporting innovative labor exchange platforms."
          },
          {
            "role": "user",
            "content": "${responses.firstQuestion}, ${responses.secondQuestion}, ${responses.thirdQuestion}, ${responses.fourthQuestion}, ${responses.fifthQuestion}, ${responses.sixthQuestion}`, ${responses.seventhQuestion}`"
          }
        ],
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

    const pitchDeckFinal = await createChatCompletion({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            "role": "system",
            "content": "As a pitch deck creation service, your main purpose is to write slides for companies' presentations. \nThe companies will provide answers to the questions listed below. These questions are written to understand companies’ business in the fastest way. I've also provided the information -with additional and necessary tags-, explanations and instructions you need to do your job below. \n<Additional information starts>\nWhat is a pitch deck? (when you know the definition you will do your job better)\nPitch decks, also known as marketing decks, are primarily used by businesses trying to convince clients or investors to work with them. They're short presentations to help someone else learn about companies’ business quickly.\n<Additional information ends>\n<Necessary information starts>\nWhat are the questions we will be asking? (when you know the questions we will be asking, you can analyze the answers they will give better.)\n<NOTE starts>\nThe questions you will see below are what the user sees. My explanations are between the parentheses.\n<NOTE ends>\nQuestion 1: Who are you?\nDetails: Provide your name surname title & project/startup name and contact details like e-mail and phone number.\nQuestion 2: What is the problem?\nDetails: Describe the pain: what are the top 3 problems that your (potential) customers have?\nQuestion 3: What is your solution?\nDetails: Describe the satisfaction: what are the top 3 features of your product that will solve customers' problems (one solution for each problem)\nQuestion 4: What is the value proposition?\nDetails: Explain the value of the solution and/or the value of satisfaction you provide. A simple, straightforward, compelling message that states why you are different and worth paying attention to.\nQuestion 5: What is underlying magic?\nDetails: Describe the technology, formula, unfair advantage and magic behind the product. Why can't be easily copied? (your secret sauce) \nQuestion 6: Who are the target customers?\nDetails: Explain who is ready to buy your product. Name your target customers and users.\nQuestion 7: Explain the go-to-market plan.\nDetails: How will you reach customers? Tell about early adopters; activities and strategies.\n Question 8: What are cost metrics?\nDetails: Key costs which are needed to produce and sell, like HW, SW, CAC, distribution costs, hosting, people etc.\nQuestion 9: What are revenue metrics?\nDetails: Key revenue metrics; how many customers you can reach, how many sales you can make, how much revenue you can create, CLTV etc, separately.\n Question10:What is the time plan?\nDetails: Explain the current status and next steps\n<Necessary information ends>\n\n<Necessary information starts>\nHow have the famous companies’ pitch decks been made so far? (when you know ‘how’ did they, you can do your job better)\n<NOTE starts>\nI will give all examples with important inferences and also I will give an example of how they would have answered if they had answered our questions. In that way, you can understand the correlation between pitch decks and questions better.\n<NOTE ends>\n<NOTE starts>\nslides will be as /slide/ and if there is an image or table it will be as ^image, table description^\n<NOTE ends>\n—Dropbox Pitch Deck—\nDropbox is one of the pioneers of cloud storage as we know it today, and their 2007 promotional presentation was about revolutionizing the way people store and share important data.\nThe company has raised approximately $1.7 billion in funding and is backed by popular investors such as JP Morgan and Sequoia Capital.\n/First Slide/\nDropbox\nMoving the world's files\nhttp://www.getdropbox.com\n /First Slide/\n/Second Slide/\nStorage is a mess\n^messy office image^\n /Second Slide/\n/Third Slide/\nIt's 2007, and it's still a pain to...\n*   Work on multiple computers\n*   Share files across a team\n*   Put photos, video onto the web\n*   Protect files from loss\n /Third Slide/\n/Fourth Slide/\nWhat are people doing now?\n*   Email attachments\n*   USB drives\n*   Browser uploads\n*   Piecemeal solutions\n/Fourth Slide/\n/Fifth Slide/\nIn a perfect world...\n*   Your files available wherever you are, on any device\n*   Never worry about losing data, can always undo\n*   Sharing, putting media onto the web is drag-and-drop\n /Fifth Slide/\n/Sixth Slide/\nDropbox\n*   Keeps files:\n*   In sync across computers\n*   Backed up\n*   Accessible from anywhere\n*   Easy to share\n*  It just works\n /Sixth Slide/\n/Seventh Slide/\nDemo\n^demo images^\n /Seventh Slide/\n/Eighth Slide/\nWhy now?\n*   Lots of devices, bigger files, more content\n*   Increasingly distributed/remote teams\n*   Falling bandwidth, storage prices\n*   Online storage is unclaimed, unmonetized territory, much like search pre-Google\n /Eighth Slide/\n/Ninth Slide/\nWhy better?\n*   Solves the entire genre of storage-related problems with one app\n*   Deep OS integration, visual feedback\n*   Doesn't make you change the way you work\n*   Open APIs to link desktop & web applications\n /Ninth Slide/\n/Tenth Slide/\nCompetitors\n^table with opponents^\nDropbox\nCarbonite, Mozy Foldershare\nbox.net\nSync\nBackup\nSharing\nOS integration\nWeb access\nVersioning\netc.\n/Tenth Slide/\n/Eleventh Slide/\nWhat did they screw up?\n*   Only tackle small pieces of the problem\n*   Poor technical execution\n*  Clumsy, verbose & technical UIs;  require configuration\n*   Lack of distribution, partners\n /Eleventh Slide/\n/Twelfth Slide/\nTechnical advantages\n*   Client & server written in Python: 5-10x faster development time\n*   Leverage Amazon S3, EC2 to achieve scale & reliability\n*   Obsession with performance\n*   Seamless compression, encryption, binary diffing, failure recovery\n /Twelfth Slide/\n/Thirteenth Slide/\nTeam\n*   Drew Houston - CEO  S.B. MIT EECS; first line of code at age 6; first startup gig at 14; founded online  SAT prep co after multiple perfect scores\n*   Arash Ferdowsi - CTO\n* S.B. MIT EECS (on leave);  director of MIT  programming competition;  prior exp at Google\n<team photo>\n /Thirteenth Slide/\n/Fourteenth Slide/\nBusiness model\n*   Individuals: freemium\n*  SMB: shared folder per-seat license (replaces backup, Windows file share, collaboration tools, reduces IT headcount)\n*   Platform: broker all UGC from the desktop to the web\n /Fourteenth Slide/\n/Fifteenth Slide/\nPlatform\n*   Onramp for all UGC from desktop - web\n*   Convenient for users: drag and drop instead of sign-in and browser upload\n*   Beneficial for web apps: more content uploaded, less friction & fewer failures\n*   Bigger picture: all files in Dropbox, delegate access to web apps\n /Fifteenth Slide/\n/Sixteenth Slide/\nCustomer acquisition\n*   Loved by early adopters/beta users (natural influencers)\n*   Free accounts for individuals\n*   Viral elements: file sharing, shared folders, photo media galleries\n*   Platform, partnerships -> free customer acquisition\n /Sixteenth Slide/\n/Seventeenth Slide/\n• Ranked #1 among summer YC startups:\n\"…..the simplicity and elegance of its interface, which blends seamlessly into both Windows and OS X, sets it apart.\"\nhttp://venturebeat.com/2007/08/16/the-y-combinator-list/\n/Seventeenth Slide/\nWhat makes Dropbox's investor presentation stand out among others is how it handles the \"why\" behind the whole idea of ​​cloud storage.\nAs you review the slides, you'll notice how each chapter focuses on how Dropbox's solution will benefit users and society as a whole by changing the way people work with files.\nThey also go into detail about why investing in the company was a good idea at the time, creating a strong justification for securing the financing they need.\nKEY INFERENCE: Make a comparison with your competitors to show how your product is doing better. Focus on the features, then add the benefits to explain why these features are worth investing in.\n \nIt's also a good idea to explain why the timing is ideal for launching your product or company. Dropbox does this well by highlighting trends related to its target audiences, such as the increased use of digital devices and more distributed/remote working teams.\nWhat would be the if Dropbox had answered the analysis questions?\nQuestion 1: Who are you?\nName: Drew Houston (CEO)\nProject / Startup Name: Dropbox\nContact details: linkedin.com/in/drewhouston\n\nQuestion 2: What is the problem?\nTop 3 problems:\n1. Working on multiple computers\n2. Sharing files across a team\n3. Putting photos and videos onto the web\n \nQuestion 3: What is your solution?\nTop 3 features:\n1. Keeps files in sync across computers\n2. Backs up files\n3. Provides easy access and sharing from anywhere\n \nQuestion 4: What is your value proposition?\nSimple, clear, compelling message: Dropbox changes the way you work with files by enhancing access, synchronization, and sharing.\n \nQuestion 5: What is the underlying magic?\nTechnology, formula, advantage: Dropbox leverages Python for faster development, utilizes Amazon S3 and EC2 for scale and reliability, and incorporates seamless compression, encryption, binary diffing, and failure recovery.\n \nQuestion 6: Who are your target customers?\nTarget customers: Individuals, SMBs (for shared folder per-seat license), and platforms (to broker user-generated content from desktop to web).\n \nQuestion 7: Explain your go-to-market plan.\nGo-to-market plan: Dropbox focuses on early adopters and beta users, offers free accounts for individuals, utilizes viral elements like file sharing and shared folders, and leverages partnerships for free customer acquisition.\n \nQuestion 8: What are the cost metrics?\nKey costs: Hardware, software, customer acquisition cost (CAC), unit cost, retention costs, hosting costs, distribution costs, and people costs.\n \nQuestion 9: What are the revenue metrics?\nKey revenue metrics: Number of customers reached, number of sales made, total revenue generated, customer lifetime value (CLTV).\n \nQuestion 10: What is the timeplan?\nCurrent status: Ranked #1 among summer YC startups.\nNext steps: Continual improvement and growth in user base and partnerships.\n\n-–Tinder Pitch Deck—\nTinder, formerly known as Matchbox, is one of the most popular dating apps in the world.\nWhile Tinder's pitch deck below is not officially affiliated with any funding round, the app has managed to raise over $50 million in just three rounds.\n/First Slide/\nMatch Box\nthe flirting game..\n/First Slide/\n/Second Slide/\nMeet Matt\n^photo of a young man^\n \n/Third Slide/\nMatt spots a girl he likes at a party...\nBUT, like most of us, Matt won't go over to say hello\n /Third Slide/\n/Fourth Slide/\nHe has the same problem most of us do...\nFEAR OF REJECTION!\n /Fourth Slide/\n/Fifth Slide/\nMeet the cure..\n^photo of an app^\n/Fifth Slide/\n/Sixth Slide/\n(Explaining the app with images)\n /Sixth Slide/\n/Seventh Slide/\nUnder the hood\nNEW Signals for Relevence\n*   Hyper-location (Using WIFI, not GPS)\n*   Mutual liking\n*   Social interests in common\n*   Friends in common\n /Seventh Slide/\n/Eighth Slide/\nRevenue Opportunity\nIn-app Purchases\n*   2 matches exposed for free  $1 to see each new match thereafter\n*   Pay to send virtual flirt gifts (drink, rose, etc)\n*   Pay to show up higher in Like or Not list\n/Eighth Slide/\nSo what makes it so great?\nFirst, they do an excellent job of communicating the problem with a short (but relatable) story. Then, instead of talking about the solution, they show it in their app.\nThe next few slides dive deep into the app's functionality – how it works and the value it provides. Using step-by-step screenshots, they drop their conversation into their apps.\nFinally, the investor presentation outlines, in two short slides, additional features in development and the revenue opportunity or how they plan to monetize. \nKEY INFERENCE: Using storytelling to explain a problem can make it more relatable and easier to understand. A good pitching platform puts investors in the customers' shoes, which naturally makes them more curious to learn about the solution.\nAnother lesson to be learned here is to use the functionality of your product to explain the solution. Tinder does a great job of telling users how to navigate the app with step-by-step screenshots to meet their needs.\nWhat would be the if Tinder had answered the analysis questions?\nQuestion 1: Who are you?\nMy name is Sean Rad and I am the founder of Match Box. You can reach me at Seanrad@tinder.com.\nQuestion 2: What is the problem?\nThe top 3 problems that our potential customers have are:\n1. Fear of rejection when approaching someone they are interested in.\n2. Difficulty finding people with similar interests and social circles.\n3. Limited options for meeting new people, especially in specific locations.\nQuestion 3: What is your solution?\nOur solution consists of the following features that will solve these problems:\n1. Hyper-location: Using WIFI, not GPS, we provide users with matches who are located near them.\n2. Mutual liking: Users only connect with each other if there is a mutual interest.\n3. Social interests and friends in common: We take into account users' social connections and interests to provide more relevant matches.\nQuestion 4: What is the value proposition?\nOur solution offers a unique and innovative way for individuals to overcome their fear of rejection and easily connect with potential matches. We enhance the dating experience by providing a platform that is based on users' shared interests and social connections.\nQuestion 5: What is the underlying magic?\nThe technology behind Match Box includes hyper-location tracking using WIFI, which allows us to provide matches that are nearby. Additionally, our algorithm considers mutual liking, social interests, and friends in common, creating an experience that cannot be easily replicated.\nQuestion 6: Who are the target customers?\nOur target customers are individuals who are actively looking for romantic connections. They are tech-savvy and open to using dating apps to meet new people.\nQuestion 7: Explain the go-to-market plan.\nOur go-to-market plan involves targeting early adopters who are likely to embrace new dating technologies. We will use marketing strategies, such as social media campaigns, advertising, and partnerships with influencers, to reach our target audience. We will also focus on building a strong user base in specific locations before expanding globally. \nQuestion 8: What are the cost metrics?\nKey costs include hardware and software development, customer acquisition costs (CAC), distribution costs, hosting fees, and costs related to maintaining the service. Additionally, people costs for maintaining the platform and providing customer support are also considered.\nQuestion 9: What are the revenue metrics?\nKey revenue metrics include the number of users who make in-app purchases, such as paying to see new matches or sending virtual flirt gifts. We also track the revenue generated from advertising partnerships and additional premium features that users can opt for. \nQuestion 10: What is the time plan?\nCurrently, Match Box is in the development stage. Our next steps involve beta testing with a select group of users and refining the app based on their feedback. We aim to launch the app within the next six months and continue to iterate and improve based on user feedback and market demand.\n—Airbnb Pitch Deck—\nThe best investor presentation presents information in a quickly digestible, easy-to-understand way. This is where Airbnb's investor talk shines.\n/First Slide/\nWelcome\nAirBed&Breakfast\nBook rooms with locals, rather than hotels.\n /First Slide/\n/Second Slide/\nProblem:\nPrice is an important concern for customers booking travel online.\nHotels leave you disconnected from the city and its culture.\nNo easy way exists to book a home with a local or become a host.\n /Second Slide/\n/Third Slide/\nSolution:\nA web platform where users can rent out their space to host travelers to:\nSAVE\t\t\tMAKE\t\t\tSHARE\nMONEY\t\tMONEY\t\tCULTURE\nwhen traveling\t\twhen hosting\t\tlocal connection to the city\n /Third Slide/\n/Fourth Slide/\nMarket Validation:\n630,000\t\t\t\t17,000\non temporary housing site\t\ttemporary housing listings on SF\ncouchsurfing.com\t\t\t& NYC Craigslist from 07/09 - 07/16\n /Fourth Slide/\n/Fifth Slide/\nMarket Size:\n1.9 Billion+ \t\t\t\t532M\t\t\t\t\t10.6M\nTRIPS BOOKED (WORDLWIDE)\tBUDGET & ONLINE TRIPS\t\tTRIPS W/AB&B\nTotal Available Market\t\t\tServiceable Available Market\t\tMarket Share\n /Fifth Slide/\n/Sixth Slide/\nProduct:\nSEARCH BY CITY-> REVIEW LISTINGS-> BOOK IT!\n^website images^\n /Sixth Slide/\n/Seventh Slide/\nBusiness Model:\nWe take a 10% commission on each transaction.\n10.6M\t\t\t$20\t\t\t$200M\nTRIPS W/AB&B\tAVG FEE \t\tREVENUE\nShare of Market\t$70/night @ 3 nights\t2008-2011\n /Seventh Slide/\n/Eighth Slide/\nMarket Adoption:\nEVENTS\ntarget events monthly\nOctoberfest (6M)\nCebit (700,000)\nSummerfest (1M)\nEurocup(3M+)\nMardi Gras (800,000)\nwith listing widget\nWidget screenshot\n \nPARTNERSHIPS\ncheap/alternative travel\nGoLoco\nKAYAK\nSABITZ\n \nCRAIGSLIST\ndual posting feature\nAirBnB screenshot\nCraigslist screenshot\n /Eighth Slide/\n/Ninth Slide/\nCompetition \n^table^\nCSi\nCouchSurfing craigslist\n& BedandBreakfast.com\nOFFLINE TRANSACTION\nAFFORDABLE\nAirBed&Breakfast\nHostels (ilcom\nONLINE TRANSACTION\nhôtels.com.\nTVRBO\nEXPENSIVE\n\n/Tenth Slide/\nCompetitive Advantages\n1s TO MARKET\nHOST INCENTIVE\nLIST ONCE\nEASE OF USE\nPROFILES\nDESIGN & BRAND\n/Tenth Slide/\nAirbnb's pitch deck is often cited as one of the best and has helped raise over $112 million.\nEach slide is simple, presenting information quickly and efficiently. They also added pictures and charts to show what they mean, avoiding the pitfalls of sticking to text-only.\nKEY INFERENCE: You don't want to bore your audience, but you also want them to know exactly what your product or service is trying to do. Airbnb's investor presentation is a prime example of simplicity.\nWhat would be the if AirBnB had answered the analysis questions?\nQuestion 1: Who are you?\nI am name, the founder of AirBed&Breakfast. You can reach me at example@gmail.\nQuestion 2: What is the problem?\nThe top 3 problems that our potential customers have are:\n- Price is an important concern for customers booking travel online.\n- Hotels leave travelers disconnected from the city and its culture.\n- There is no easy way to book a home with a local or become a host. \nQuestion 3: What is your solution?\nOur solution is a web platform where users can rent out their space to host travelers, allowing them to save money when traveling, make money when hosting, and have a local connection to the city.\nQuestion 4: What is your value proposition?\nOur value proposition is to change the way people travel by offering affordable accommodations that provide a unique and authentic experience. We enhance the travel experience by connecting travelers with local hosts and allowing them to immerse themselves in the culture of the city they are visiting.\nQuestion 5: What is the underlying magic?\nThe underlying magic behind AirBed&Breakfast is our technology platform, which provides a seamless and user-friendly experience for both hosts and travelers. Our algorithms match hosts and travelers based on their preferences and requirements, ensuring a successful and enjoyable stay. This technology advantage makes it difficult for competitors to replicate our platform.\nQuestion 6: Who are your target customers?\nOur target customers are travelers who are looking for affordable and unique accommodations, as well as hosts who want to make extra income by renting out their space. We cater to a wide range of customers, from budget-conscious travelers to those seeking a more authentic and local experience.\nQuestion 7: Explain your go-to-market plan.\nWe will reach customers through a combination of marketing and distribution channels. Our strategy includes targeting events and partnerships with travel-related companies to increase our visibility and attract early adopters. We will also leverage platforms like Craigslist to reach a larger audience and provide a dual posting feature for easy listing.\nQuestion 8: What are your cost metrics?\nOur key costs include hardware and software infrastructure, customer acquisition costs (CAC), distribution costs, hosting, and personnel. We have a detailed cost analysis that takes into account both fixed and variable costs to ensure a sustainable business model.\nQuestion 9: What are your revenue metrics?\nOur revenue metrics include the number of customers we can reach, the number of sales we can make, the average fee per booking, and the customer lifetime value (CLTV). By tapping into the 10.6 million trips with AirBed&Breakfast, we can generate substantial revenue and capture a significant market share.\nQuestion 10: What is the time plan?\nCurrently, AirBed&Breakfast is already operational and has gained market validation with over 630,000 listings on temporary housing site Couchsurfing.com and 17,000 listings on SF & NYC Craigslist from 07/09 - 07/16. Our next steps include expanding our market adoption through targeted events and partnerships, as well as improving our platform based on user feedback and market demands.\n<Necessary information ends>\n\n<INSTRUCTION starts>\nFirst of all the pitch deck should be 10 slides. Use all of the given details, instructions, methods, notes, information and pieces of knowledge you know to think and questions to understand the businesses of the company. You can use details, examples and data that are not mentioned but go out of context. Check back after you've finished the presentation and make it the best it can be. Don't forget to mention the presenter and the title and contact details. Think of pictures and visuals that could be included or beautify and support the presentation. for example, a Tinder had used a photo of a young man. In fact, let's say that a problem related to carrying apples is solved, a picture of a truck carrying apples can be posted. You must show the images with <insert image description> at the end of each slide.\nAs you can see from the examples on the first slide, things such as the brand's name, certain, and the slogan, addition, are generally preferred. \nThe second and third slides usually show the problem first and then the solution.\nWhile giving the problem and the solution, the context was taken into consideration and not broken. You don't have to use the given problem titles directly. but in some places the problem is given directly and in some places it is narrated by storytelling. \nYou can consider the seriousness and emotional state of the company when deciding on this for example; if you saw an emotional topic like Tinder, there is a ‘love’ factor, in writing a story, giving examples sarcastically (if its fun) will allow viewers to empathize and see through the eyes of the target costumers. Or you saw another emotional topic like global warming giving examples or telling a sad story, a word from a famous person might be good. on the other hand, if there is real data but didn't mention you can use it, give solid examples, statistics or a reference to a scientific book. do not forget to highlight the important points, you should introduce the company to the audience in the best way, while doing this, do not write very long articles, be short and concise.\nIn the general structure of the presentation; Don't forget to mention the titles and contents of the value proposition, underlying magic, target customers, go-to-market plan, cost metrics, revenue metrics and time plan. You can evaluate slides 4, 5, 6, 7, 8, 9, and 10 for them, respectively.\nFinally, there MUST be an image indicator at the end of each slide. If you have a picture that you think would be appropriate, write it as <description of the picture> at the end of the slide. The image must be object-based for example a person, people, trees-nature or any living things; it can be a building, a city, a vehicle or traffic, etc. Be careful not to use abstract expressions\n\nyou can only use this format:\n<YOUR OUTPUT FORMAT>\n[\n{\n\"q1_text\":”<insert what you want to write on slide one>\",\n\"q1_image\":\"<insert your describing for the image that you want to put on slide one>\"\n},\n{\n\"q2_text\":”<insert what you want to write on slide two>\",\n\"q2_image\":\"<insert your describing for the image that you want to put on slide two>\"\n},\n(write down each slide until slide ten. write your text in part. you can get a new sentence in a single input)\n{\n\"q10_text\":”<insert what you want to write on slide ten>\",\n\"q10_image\":\"<insert your describing for the image that you want to put on slide ten>\"\n},\n]\n<YOUR OUTPUT FORMAT>\nyou can't say any assistant words like; Sure! or Please review the presentation etc.\nContinue from the first slide to the tenth slide and check for the last time for any missing or mistakes. DO NOT FORGET THE IMAGE PART.\n<INSTRUCTION ends>\n\n\n\n"
          },
          {
            "role": "user",
            "content": "Hello, I am Görkem Yağcı, I have been the CEO of our startup Mercury.Tech since 2023. Our startup's email address is ertugrultunc38@gmail.com, phone number is 05432308084.\nOur 1. problem is that people cannot find a team, job, freelancer job they feel they belong to, either paid or unpaid.\nOur second problem is that the teams and people who want to develop their own business do not have anyone to help them in the job position they are looking for. So if you don't have money, you can't find people to trade your workforce.\nOur third problem is that the exchanged workforce does not have the ground to cooperate later in a suitable and reliable environment. In other words, there is no precaution against fraudsters who will exploit the workforce.\nThe solution is very simple, first of all, create a safe environment where people can safely share their workforce and not exploit each other's rights. Then, designing and adjusting the system according to each business category, and finally, making each other's work and doing the work they want with their own field of expertise and making them use the labor exchange instead of money. We call this swap a match.\nOur difference is that we do not force people to financially when they want to develop a business. If you are a resourceful and intelligent person, you can buy a job by giving money with what you can do. Here, both sides proceed in line with their own interests. For example, if a plumber wants to build a website for himself, he does the plumbing in response to the plumbing needs of a software developer and gets a website in return. We bring those in need together with the workforce, not money.\nOur technology is our algorithm. In the face of an algorithm that develops and learns as a result of determining who needs what and who needs what and who is doing what with the information obtained in advance, we always direct whoever needs what to the needs of the appropriate people or inform them through the notification method.\nWe bring together people who do not want to spend a lot of money, but who want to grow by working constantly.\nWe want to ensure that we remain partners or brokers in these paid business plans by always being in favor of cooperation in our market plan and growth target, by ensuring that people who have done business together continue in their workforce and do new jobs, and by having paid business plans set up.\nOur first office was opened in the first quarter of 2023 and we want to make our first investment in the second quarter of 2023 and upgrade the mvp version to pro in the third quarter of 2023.\n\nhere is the detils you can use:\n- Industry: Freelancing/Job marketplace\n- Sector: Workforce management/Job matching\n- Vision: To create a safe and reliable platform for people to exchange their skills and services without relying on traditional monetary transactions\n- Mission: Assist individuals and teams in finding a suitable workforce or job position, fostering cooperation and growth opportunities\n- Presentation language style: Informative, practical, and focused on the benefits of a non-monetary labor exchange system and a little bit of fun cause of human relations.\n- Target customers: Individuals and teams looking for a job or workforce, particularly those who want to develop their own business or trade their skills\n- Target presentation viewers: Investors, potential partners or clients who are interested in supporting innovative labor exchange platforms"
          },
          {
            "role": "assistant",
            "content": "[{\n\"q1_text\":\"Mercury.tech\\n Görkem Yağcı(CEO)\\n ertugrultunc38@gmail.com\",\n\"q1_image\":\"Amazing view of a planet on space\"\n},\n{\n\"q2_text\":\"here is a graphic designer:(he wants to make a portfolio site but don't know how to code it)\"\n},\n{\n\"q2_image\":\"Image of a sad man.\"\n},\n{\n\"q3_text\":\"Oh! Look at it there. Here is a developer man that wants to make a logo for his startup. They can meet on Mercury.tech!\",\n\"q3_image\":\"Image of a person holding a lightbulb.\"\n},\n{\n\"q4_text\":\"-Redefining labor exchange with a focus on skill-based matching and cooperation. Safe environment that fosters cooperation\\n- Customized system for different business categories\\n- Monetization through non-monetary labor exchanges.\\n We are the only ones in the market who do this job\",\n\"q4_image\":\"Image of a handshake\"\n},\n{\n\"q5_text\":\"Our algorithm!  We designed an advanced algorithm that matches individuals based on their needs and expertise with technical infrastructure and integrations such as Node.js, PostgreSQL, RabbitMQ and a special artificial intelligence, where everyone can exchange business with each other in the fastest and most reliable way.\",\n\"q5_image\":\"Image of a castle\"\n},\n{\n\"q6_text\":\"You! Everyone in the freelance sector. Individuals and teams seeking suitable workforce or job positions. Freelancers\\n- Startups and small businesses\\n- Teams looking to collaborate on projects\",\n\"q6_image\":\"Image of crowded people\"\n},\n{\n\"q7_text\":\"-Growth through cooperation and paid business plans \\n Focus on cooperation and long-term partnerships\\n- Paid business plans to generate revenue\\n- Expansion into new markets and industries\",\n\"q7_image\":\"image of an increasing graph\"\n},\n{\n\"q8_text\":\"Key Cost Metrics\\n- Development and maintenance of the platform\\n- Server and hosting costs\\n- Marketing and advertising expenses\\n- Operational costs\\n- Staffing and personnel expenses\",\n\"q8_image\":\"Image of a budget or financial report\"\n},\n{\n\"q9_text\":\"Key Revenue Metrics\\n- Number of users / customers\\n- Number of transactions or exchanges\\n- Revenue generated from paid business plans\\n- Advertising and partnership revenue\\n- Expansion into new markets and industries\\n- Customer lifetime value (CLTV)\",\n\"q9_image\":\"Image of a money sign or revenue symbol\"\n},\n{\n\"q10_text\":\"- Office opening in Q1 2023\\n- Investment in Q2 2023\\n- MVP upgrade to pro in Q3 2023\",\n\"q10_image\":\"Image of a timeline\"\n}\n]"
          },
          {
            "role": "user",
            "content": '${responses.firstQuestion}, ${responses.secondQuestion}, ${responses.thirdQuestion}, ${responses.fourthQuestion}, ${responses.fifthQuestion}, ${responses.sixthQuestion}`, ${responses.seventhQuestion}`; ${companyAnalyzer}'
          }
        ],
        temperature: 1,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const finalResponses = JSON.parse(pitchDeckFinal)
      const firstSlideText = finalResponses.q1_text
      const problemExplanation = finalResponses.q2_text
   
      const secondSlideImageText = await createChatCompletion({
        model: "gpt-3.5-turbo-16k",
        messages: [
          {
            "role": "system",
            "content": "image generator..."
          },
          {
            "role": "user",
            "content": "${finalResponses.q2_image}"
          }
        ],
        temperature: 1,
        max_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const secondSlideImage = await generateImages({
        prompt:`${finalResponses.q2_image}`,
        n:1,
        size:'1024x1024'
    })
    return { firstSlideText, secondSlideImageText, secondSlideImage, problemExplanation, thirdSlideImageText, 
        thirdSlideImage, solutionExplanation, fourthSlideImageText, fourthSlideImage, valuePropositionExplanation, fifthSlideImageText, 
        fifthSlideImage, underlyingMagicExplanation, sixthSlideImageText, sixthSlideImage, targetCustomerExplanation, pitchDeckKeywords,
        seventhSlideImageText, seventhSlideImage, marketPlanExplanation, tenthSlideTextAsCss, timePlanExplanation }
}

const generatePitchDeckSlides = async(answers, responses) => {
    const pitchDeckSlides = []
    pitchDeckSlides.push({
        "slide-type":'introducing',
        "company-details":{
            "name-surname":responses.companyDetails.nameSurname,
            "title":responses.companyDetails.title,
            "email":responses.companyDetails.email,
            "phone-number":responses.companyDetails.phoneNumber,
            "startup-name":responses.companyDetails.startupName,
            "date":responses.companyDetails.date
        }
    })
    pitchDeckSlides.push({
        "slide-text":answers.problemExplanation,
        "slide-images":[{
                "image-url":answers.secondSlideImage
            }]
    })
    pitchDeckSlides.push({
        "slide-text":answers.solutionExplanation,
        "slide-images":[{
                "image-url":answers.thirdSlideImage
            }]
    })
    pitchDeckSlides.push({
        "slide-text":answers.valuePropositionExplanation,
        "slide-images":[{
                "image-url":answers.fourthSlideImage
            }]
    })
    pitchDeckSlides.push({
        "slide-text":answers.underlyingMagicExplanation,
        "slide-images":[{
                "image-url":answers.fifthSlideImage
            }]
    })
    pitchDeckSlides.push({
        "slide-text":answers.targetCustomerExplanation,
        "slide-images":[{
                "image-url":answers.sixthSlideImage
            }]
    })
    pitchDeckSlides.push({
        "slide-text":answers.marketPlanExplanation,
        "slide-images":[{
                "image-url":answers.seventhSlideImage
            }]
    })
    pitchDeckSlides.push({
        "slide-type":"cost-metrics",
        "slide-text":{
            "unit-transaction":responses.costMetrics.unitTransaction,
            "unit-costs":responses.costMetrics.unitCosts,
            "total-costs":responses.costMetrics.totalCosts,
            "cac":responses.costMetrics.cac
        }
    })
    pitchDeckSlides.push({
        "slide-type":"revenue-metrics",
        "slide-text":{
            "unit-transaction":responses.revenueMetrics.unitTransaction,
            "price":responses.revenueMetrics.price,
            "total-revenue":responses.revenueMetrics.totalRevenue,
            "cltv":responses.revenueMetrics.cltv
        }
    })
    pitchDeckSlides.push({
        "slide-text":answers.timePlanExplanation,
        "css-code":answers.tenthSlideTextAsCss,
        "time-plan-details":{
            "enterprise-release-date":responses.timePlanDetails.enterpriseReleaseDate,
            "company-release-date":responses.timePlanDetails.companyReleaseDate,
            "first-demo-release-date":responses.timePlanDetails.firstDemoReleaseDate,
            "first-map-release-date":responses.timePlanDetails.firstMapReleaseDate,
            "first-investment-round-date":responses.timePlanDetails.firstInvestmentRoundDate,
            "product-finalized-date":responses.timePlanDetails.productFinalizedDate
        }
    })
    return pitchDeckSlides

}

module.exports = new PitchDeckController()