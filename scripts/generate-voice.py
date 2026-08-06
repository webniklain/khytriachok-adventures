import asyncio
from pathlib import Path

import edge_tts


VOICE = "uk-UA-OstapNeural"

RATE = "+50%"
PITCH = "+90Hz"
VOLUME = "+10%"

PHRASES = {
    "public/audio/khytriachok/greetings/hello-01.mp3":
        "Привіт! Я Їжачок Хитрячок! Давай рахувати!",

    "public/audio/khytriachok/greetings/hello-02.mp3":
        "Привіт! Я вже чекав на тебе!",

    "public/audio/khytriachok/greetings/hello-03.mp3":
        "Нумо разом розв'язувати приклади!",

    "public/audio/khytriachok/correct/correct-01.mp3":
        "Фир-р-р! Молодець!",

    "public/audio/khytriachok/correct/correct-02.mp3":
        "Правильно! Чудова робота!",

    "public/audio/khytriachok/correct/correct-03.mp3":
        "Супер! Ти все правильно порахував!",

    "public/audio/khytriachok/correct/correct-04.mp3":
        "Так тримати! У тебе чудово виходить!",

    "public/audio/khytriachok/correct/correct-05.mp3":
        "Ура! Це правильна відповідь!",

    "public/audio/khytriachok/wrong/wrong-01.mp3":
        "Нічого страшного. Спробуй ще раз!",

    "public/audio/khytriachok/wrong/wrong-02.mp3":
        "Майже! Подивись уважніше на їжачків.",

    "public/audio/khytriachok/wrong/wrong-03.mp3":
        "Не поспішай. У тебе обов'язково вийде!",

    "public/audio/khytriachok/celebration/yay-01.mp3":
        "Фир-р-р! Ми впоралися!",

    "public/audio/khytriachok/celebration/yay-02.mp3":
        "Ого! Які ми молодці!",

    "public/audio/khytriachok/celebration/yay-03.mp3":
        "Чудово! Готовий до наступного прикладу?",
}


async def generate_file(output_path: str, text: str) -> None:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE,
        rate=RATE,
        pitch=PITCH,
        volume=VOLUME,
    )

    await communicate.save(str(path))
    print(f"Created: {path}")


async def main() -> None:
    for output_path, text in PHRASES.items():
        await generate_file(output_path, text)

    print("")
    print("All Khytriachok voice files generated.")


if __name__ == "__main__":
    asyncio.run(main())
