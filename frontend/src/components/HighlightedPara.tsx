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
    <a key={index} href={`/${phrase}`} className="text-blue-500">
      {phrase}
    </a>
  ));

  const regex = new RegExp(`\\b(${phrases.join("|")})\\b`, "gi");
  const replacedParagraph = paragraph.replace(regex, (match) => {
    const matchingPhrase = phrases.find((phrase) =>
      new RegExp(`^${phrase}$`, "i").test(match)
    );
    return matchingPhrase
      ? `<a href="/${matchingPhrase}" class="text-blue-500">${match}</a>`
      : match;
  });

  return (
    <div className="prose">
      <p dangerouslySetInnerHTML={{ __html: replacedParagraph }} />
    </div>
  );
};

export default HighlightedParagraph;
