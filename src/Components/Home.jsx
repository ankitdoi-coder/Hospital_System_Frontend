import React from "react";
import cImg from "../assets/Cartoon1.png";
import cImg2 from "../assets/Cartoon2.png";

const Home = () => {
    return (
        <div className="">
 {/* // CHANGE IS ON THIS LINE */}
            <section className=" w-full flex flex-col md:flex-row items-center justify-between pl-6 md:pl-16 py-10 bg-gradient-to-r from-white to-blue-50">

                {/* Left Side - Text Cont   ent */}
                <div className="md:w-1/2 text-center md:text-left space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        We help people to <br /> get appointment <br /> in online
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        Lorem Media is a full-service social media agency. We offer businesses innovative
                        solutions that deliver the right type of audience to you in the most effective
                        strategies possible. We strive to develop a community around your business, polish
                        your branding, and improve your public relations.
                    </p>
                </div>

                {/* Right Side - Image */}
                {/* CHANGE IS ON THIS LINE */}
                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-end">
                    <img
                        src={cImg}
                        alt="People getting appointment online"
                        className="w-[400px] md:w-[500px] object-contain"
                    />
                </div>
            </section>

            <section className="py-20 px-6 md:px-16">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-16">

                        {/* Left Side: Image */}
                        <div className="md:w-1/2">
                            <img
                                src={cImg2}
                                alt="Illustration of a person pointing at user interface elements"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Right Side: Text Content */}
                        <div className="md:w-1/2">
                            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                                Biography
                            </p>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                                Who We Are
                            </h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>
                                    Lorem Media is a full-service social media agency. We offer businesses innovative solutions that deliver the right type of audience to you in the most effective strategies possible. We strive to develop a community around your business, polish your branding, and improve your public relations.
                                </p>
                                <p>
                                    It’s 2019: time to sink or swim.
                                </p>
                                <p>
                                    We are your Social Media Marketing Agency.
                                </p>
                                {/* The text below is repeated in the target design */}
                                <p>
                                    Lorem Media is a full-service social media agency. We offer businesses innovative solutions that deliver the right type of audience to you in the most effective strategies possible. We strive to develop a community around your business, polish your branding, and improve your public relations.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;