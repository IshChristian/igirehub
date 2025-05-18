import { Phone, ArrowRight, MessageSquare } from "lucide-react"

export default function UssdGuidePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">USSD & SMS Guide</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="bg-rwanda-blue/10 p-3 rounded-full">
              <Phone className="h-6 w-6 text-rwanda-blue" />
            </div>
            <h2 className="text-xl font-bold ml-3">USSD Guide</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Access Igire services from any phone by dialing <span className="font-bold">*677#</span>
          </p>

          <div className="space-y-6">
            <div className="bg-black rounded-xl p-4">
              <div className="bg-gray-800 rounded-lg p-3 text-white">
                <div className="text-center mb-3 text-green-400 font-mono">*677#</div>
                <div className="space-y-2 font-mono text-sm">
                  <p>Welcome to Igire</p>
                  <p>1. Submit complaint</p>
                  <p>2. Track complaint</p>
                  <p>3. View points</p>
                  <p>4. Redeem rewards</p>
                  <p className="text-gray-400">Reply with option:</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium">1</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">Submit a complaint</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Select option 1, then follow the prompts to select a category, enter your location, and describe
                    your complaint.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium">2</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">Track a complaint</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Select option 2, then enter your complaint ID to check its status.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">View your points</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Select option 3 to check your current Igire Points balance.
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium">4</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">Redeem rewards</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Select option 4 to redeem your points for airtime or other rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <div className="bg-rwanda-green/10 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-rwanda-green" />
            </div>
            <h2 className="text-xl font-bold ml-3">SMS Guide</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Submit and track complaints via SMS by sending messages to <span className="font-bold">8844</span>
          </p>

          <div className="space-y-6">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Submit a complaint</h3>
              <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 font-mono text-sm mb-2">
                IGIRE [CATEGORY] [LOCATION] [DESCRIPTION]
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Example: IGIRE WATER Kigali, Nyarugenge Water pipe broken on main street
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Track a complaint</h3>
              <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 font-mono text-sm mb-2">
                TRACK [COMPLAINT_ID]
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Example: TRACK C001</p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Check your points</h3>
              <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 font-mono text-sm mb-2">
                POINTS
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Example: POINTS</p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Redeem rewards</h3>
              <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 font-mono text-sm mb-2">
                REDEEM [REWARD_TYPE]
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Example: REDEEM AIRTIME</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-bold mb-4">SMS Notifications</h2>

        <p className="text-gray-600 dark:text-gray-300 mb-4">You will receive SMS notifications when:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowRight className="h-4 w-4 text-rwanda-blue mr-2" />
              <h3 className="font-medium">Your complaint is received</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              "Your complaint (ID: C001) has been received. We will update you on its progress."
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowRight className="h-4 w-4 text-rwanda-blue mr-2" />
              <h3 className="font-medium">Status changes</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              "Your complaint (ID: C001) status has changed to: In Progress. Agency: Water Authority."
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowRight className="h-4 w-4 text-rwanda-blue mr-2" />
              <h3 className="font-medium">Complaint is resolved</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              "Your complaint (ID: C001) has been resolved. You earned 50 Igire Points! Reply FEEDBACK to rate our
              service."
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <ArrowRight className="h-4 w-4 text-rwanda-blue mr-2" />
              <h3 className="font-medium">Points are redeemed</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              "You have successfully redeemed 50 Igire Points for 1000 RWF Airtime. Your new balance: 100 points."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
