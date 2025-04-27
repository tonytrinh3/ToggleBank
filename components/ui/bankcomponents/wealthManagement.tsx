import { motion } from "framer-motion";
import { AiOutlineAreaChart } from "react-icons/ai";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { BounceLoader } from "react-spinners";
import { useAnimation } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StocksComponent } from "@/components/ui/bankcomponents/stocksCard";
import { WealthManagementSheetInterface } from "@/utils/typescriptTypesInterfaceIndustry";

const WealthManagementSheet = ({
  data,
  aiPrompt,
  submitQuery,
  prompt,
  loading,
  aiResponse,
}: WealthManagementSheetInterface) => {
  const variants = {
    hidden: { scaleY: 0, originY: 1 },
    visible: { scaleY: 1, originY: 1 },
    exit: { x: "100%" },
  };

  const controls = useAnimation();

  const shakeAnimation = {
    shake: {
      x: [-10, 10, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      className="bg-white border border-zinc-200 rounded-xl shadow-xl h-full flex flex-col p-6 sm:p-8 xl:p-10 items-center justify-center"
    >
      <img src="banking/chart.png" height={60} width={60} alt="chart" />
      <p className="flex font-sohne py-2 text-3xl text-center">
        Review your wealth management insights
      </p>
      <p className="flex font-sohnelight pt-2 pb-8 text-large text-center">
        Roadmap for a sophisticated wealth plan
      </p>
      <Sheet>
        <SheetTrigger asChild>
          <div className="flex justify-end ">
            <Button
              variant="default"
              className="w-full px-6 py-6 shadow-2xl bg-bankdarkblue font-sohnelight rounded-xl text-[20px] mx-auto"
            >
              Start now
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent className="overflow-auto w-full sm:w-full xl:w-[80%] p-10">

          <div className={`w-full h-full font-sohne rounded-2xl`}>
            <div className="p-6 bg-gradient-bank  w-full rounded-2xl shadow-xl text-black">
              <div className="justify-center xl:justify-start">
                <p className="font-sohne mb-6 text-[24px] text-white ">
                  Wealth Management
                </p>

                <div className="flex flex-col xl:flex-row gap-y-4 sm:gap-x-4 text-gray-500">
                  <div className="px-6 pt-6 w-full flex-1 bg-white rounded-2xl">
                    <div className="flex justify-between">
                      <p className="  font-sohne font-bold text-lg">
                        Wealth Insights AI <br />
                        <span className="font-sohnelight text-xs text-zinc-400 italic">
                          Powered Anthropic Claude in By Amazon Bedrock
                        </span>
                      </p>

                      <div className="flex items-center">
                        <img src="banking/aws.png" />
                      </div>
                    </div>
                    <div className="relative py-2 sm:col-span-1 lg:col-span-2 w-full overflow-y-auto mb-4 ">
                      <div className="max-h-screen overflow-auto flex flex-col justify-center">
                        {loading ? (
                          <BounceLoader
                            color="rgb(59 130 246)"
                            size={50}
                            className="mt-10"
                          />
                        ) : (
                          <div className="font-sohnelight">
                            {aiResponse || (
                              <p className="text-zinc-300">
                                No response generated yet.
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row gap-2 pt-12">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="bg-bankdarkblue text-white rounded-2xl font-sohnelight w-full">
                              View Prompt
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="">
                            <div className="m-4 fontsohnelight">
                              <p className="text-gray-500 font-bold text-xl mb-4">
                                AWS Bedrock Configured Prompt
                              </p>
                              {aiPrompt}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          onClick={() => {
                            submitQuery(prompt);
                          }}
                          className="flex bg-white text-bankdarkblue rounded-2xl font-sohnelight items-center w-full hover:bg-zinc-100"
                        >
                          Generate{" "}
                          <ArrowRight className="text-bankdarkblue ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 w-full flex-1 bg-white rounded-2xl">
                    <div className="space-y-2">
                      <div className="bg-blue-300/30 rounded-full flex items-center justify-center w-10 h-10">
                        <AiOutlineAreaChart className="text-blue-700 h-8 w-8" />
                      </div>
                      <div className="">
                        <p className="font-sohnelight text-base">
                          <strong className="font-sohne">
                            {" "}
                            Brokerage Account{" "}
                          </strong>
                          (***6552)
                        </p>
                      </div>
                    </div>

                    <motion.button
                      className="bg-blue-500 text-white shadow-md rounded-2xl font-sohnelight w-1/2 transition-all duration-500 flex justify-center items-center px-4 py-2 mt-4"
                      onClick={async (e) => {
                        const button = e.currentTarget;
                        button.textContent = "Error";
                        button.classList.add("bg-red-500"); 
                        await controls.start("shake"); 
                        throw new Error("Error Loading Brokerage Account Details. API failed to respond");
                        setTimeout(() => {
                          button.textContent = "View Account Details";
                          button.classList.remove("bg-red-500");
                        }, 2000);
                      }}
                      animate={controls}
                      initial={false} // Ensure the initial state is not applied
                      variants={shakeAnimation}
                    >
                      View Account Details
                    </motion.button>

                    <div className="space-y-2 mt-4">
                      <div className="">
                        <p className="font-sohnelight text-base">
                          <strong className="font-sohne">
                            {" "}
                            Brokerage Account{" "}
                          </strong>
                          (***7553)
                        </p>
                      </div>
                    </div>

                    <motion.button
                      className="bg-blue-500 text-white shadow-md rounded-2xl font-sohnelight w-1/2 transition-all duration-500 flex justify-center items-center px-4 py-2 mt-4"
                      onClick={async (e) => {
                        const button = e.currentTarget;
                        button.textContent = "Error";
                        button.classList.add("bg-red-500"); 
                        try {
                          await controls.start("shake"); 
                          throw new Error("Error Loading Brokerage Account Details. API failed to respond");
                        } catch (error) {
                          console.error(error);
                        } finally {
                          setTimeout(() => {
                            button.textContent = "View Account Details";
                            button.classList.remove("bg-red-500");
                          }, 2000);
                        }
                      }}
                      animate={controls}
                      initial={false} // Ensure the initial state is not applied
                      variants={shakeAnimation}
                    >
                      View Account Details
                    </motion.button>

                    {/* <div className="pt-40">
                      <div className="text-base font-sohnelight pb-2 text-zinc-500">
                        Total investment balance:{" "}
                      </div>
                      <div className="text-green-500 text-6xl sm:text-6xl font-sohne pb-2">
                        $184,278
                      </div>
                      <div className=" text-sm font-sohnelight text-zinc-500">
                        Over lifetime of account
                      </div>
                    </div> */}
                  </div>
                  <div className="p-4  w-full flex-1 bg-white rounded-2xl">
                    <StocksComponent />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default WealthManagementSheet;
