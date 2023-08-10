import React from "react";

interface HighlightedParagraphProps {
  paragraph: string;
  phrases: string[];
}

const HighlightedParagraph: React.FC<HighlightedParagraphProps> = ({
  paragraph,
  phrases,
}) => {
  const highlightedPhrases = phrases.map((phrase, index) => (
    <a
      key={index}
      href={`https://you.com/search?q=What+is+a%3A+${phrase}&fromSearchBar=true&tbm=youchat`}
      target="_blank"
      className="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline"
    >
      {phrase}
    </a>
  ));

  const regex = new RegExp(`\\b(${phrases.join("|")})\\b`, "gi");
  const replacedParagraph = paragraph.replace(regex, (match) => {
    const matchingPhrase = phrases.find((phrase) =>
      new RegExp(`^${phrase}$`, "i").test(match)
    );
    return matchingPhrase
      ? `<a href="https://you.com/search?q=What+is+a%3A+${matchingPhrase}&fromSearchBar=true&tbm=youchat" target="_blank" class="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline">${match}</a>`
      : match;
  });

  return (
    <div className="prose">
      <p dangerouslySetInnerHTML={{ __html: replacedParagraph }} />
    </div>
  );
};

export default HighlightedParagraph;
