import React from "react";
import TimeLineImage from "../../assets/TimelineImage.png";
import Logo1 from "../../assets/TimeLineLogo/Logo1.svg";
import Logo2 from "../../assets/TimeLineLogo/Logo2.svg";
import Logo3 from "../../assets/TimeLineLogo/Logo3.svg";
import Logo4 from "../../assets/TimeLineLogo/Logo4.svg";

const timelineData = [
  {
    Logo: Logo1,
    Heading: "Expert Instructors",
    Description: "Learn from industry professionals and experienced educators",
  },
  {
    Logo: Logo2,
    Heading: "Student First",
    Description: "Your success and growth are our top priorities",
  },
  {
    Logo: Logo3,
    Heading: "Flexible Learning",
    Description: "Learn at your own pace, anytime, anywhere",
  },
  {
    Logo: Logo4,
    Heading: "Practical Skills",
    Description: "Build real-world skills through hands-on learning",
  },
];

const TimelineSection = () => {
  return (
    <div className="py-16">

      <div className="flex flex-col lg:flex-row gap-20 items-center">

        <div className="lg:w-[45%] flex flex-col gap-10">
          {timelineData.map((item, index) => (
            <div key={index} className="flex gap-6">
              <div className="w-[52px] h-[52px] bg-white rounded-full flex justify-center items-center shadow-[0_0_62px_0_#00000012]">
                <img src={item.Logo} alt={item.Heading} />
              </div>
              <div>
                <h2 className="font-semibold text-[18px]">{item.Heading}</h2>
                <p className="text-base text-richblack-300">
                  {item.Description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative shadow-blue-200 shadow-[0px_0px_30px_0px]">
          <img
            src={TimeLineImage}
            alt="Smart Study Timeline"
            className="shadow-white shadow-[20px_20px_0px_0px] object-cover h-[400px] lg:h-auto"
          />
        </div>

      </div>

    </div>
  );
};

export default TimelineSection;