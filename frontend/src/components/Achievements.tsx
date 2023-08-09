import { BiMedal } from "react-icons/bi";

const achievements = [
  {
    name: "Helpful User",
    description: "User offers help to another character",
    is_achieved: false,
    emoji: "💁",
  },
  {
    name: "Compliment Giver",
    description: "User gives a compliment to another character",
    is_achieved: false,
    emoji: "🥰",
  },
  {
    name: "Cultural Ambassador",
    description: "User shares their own culture",
    is_achieved: false,
    emoji: "🌍",
  },
  {
    name: "Cultural Explorer",
    description: "User asks about another character's culture",
    is_achieved: false,
    emoji: "🧐",
  },
  {
    name: "Master of Laughter",
    description: "User makes another character laugh",
    is_achieved: false,
    emoji: "😄",
  },
  {
    name: "Knowledge Sharer",
    description: "User teaches another character something new",
    is_achieved: false,
    emoji: "🧠",
  },
];

const icon_styles = ["#CD7F32", "silver", "gold", "blue", "red"];
const breakpoints = [1, 3, 5, 10, 50];

export default function ProcessAchievements(achievementString: string) {
  // implementation goes here
  if (achievementString === "") return <b>None</b>;
  const achievementArray = achievementString.split(" ");
  let resList = [];
  // 0:1 3:2
  for (let i = 0; i < achievementArray.length; i += 1) {
    let indexes = achievementArray[i].split(":");
    const obj = achievements[parseInt(indexes[0])];
    let icon_style = icon_styles[0];

    if (parseInt(indexes[1]) >= breakpoints[4]) {
      icon_style = icon_styles[4];
    } else if (parseInt(indexes[1]) >= breakpoints[3]) {
      icon_style = icon_styles[3];
    } else if (parseInt(indexes[1]) >= breakpoints[2]) {
      icon_style = icon_styles[2];
    } else if (parseInt(indexes[1]) >= breakpoints[1]) {
      icon_style = icon_styles[1];
    }

    resList.push(
      <p className="text-justify" key={`${i}`}>
        <BiMedal color={icon_style} fontSize="1.5em" />
        <b>
          {" "}
          {obj.emoji} {obj.name} x{indexes[1]}
          {": "}
        </b>{" "}
        {obj.description}
      </p>
    );
    if (i != achievementArray.length - 1) resList.push(<br key={`${i} br`} />);
  }
  return resList;
}
