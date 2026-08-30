from typing import Dict, Any, List
from backend.app.services.ai_interfaces import BasePedagogyProvider

PEDAGOGICAL_TEMPLATES = {
    "Class 1": {
        "Odia": "ସୂର୍ଯ୍ୟ ପାଣିକୁ ଗରମ କରେ । ପାଣି ଉପରକୁ ଉଠିଯାଏ ।",
        "English": "Sun makes water hot. Water goes up into the sky."
    },
    "Class 2": {
        "Odia": "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ଉପରକୁ ଉଠି ମେଘ ତିଆରି କରେ ।",
        "English": "Sun heats water, which turns into steam and forms clouds."
    },
    "Class 3": {
        "Odia": "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ ବୋଲି କୁହାଯାଏ ।",
        "English": "Sun heats water and changes it into water vapour. This process is called evaporation."
    },
    "Class 4": {
        "Odia": "ବାଷ୍ପୀଭବନ ଦ୍ୱାରା ଜଳ ବାଷ୍ପରେ ପରିଣତ ହୋଇ ଉପରକୁ ଉଠେ ଏବଂ ଘନୀଭବନ ଦ୍ୱାରା ମେଘ ସୃଷ୍ଟି ହୋଇ ବର୍ଷା ହୁଏ ।",
        "English": "Evaporation turns liquid water into gas, while condensation forms clouds leading to precipitation."
    },
    "Class 5": {
        "Odia": "ଜଳଚକ୍ରର ମୁଖ୍ୟ ସୋପାନ ଗୁଡ଼ିକ ହେଲା: ବାଷ୍ପୀଭବନ, ଘନୀଭବନ, ଏବଂ ଅବକ୍ଷେପଣ (ବର୍ଷା) ।",
        "English": "The hydrological cycle involves evaporation, condensation, precipitation, and collection."
    }
}

class PedagogyService(BasePedagogyProvider):
    def adapt(self, text: str, grade: str, subject: str, target_lang: str) -> Dict[str, Any]:
        grade_key = grade if grade in PEDAGOGICAL_TEMPLATES else "Class 3"
        lang_key = target_lang if target_lang in PEDAGOGICAL_TEMPLATES[grade_key] else "Odia"

        adaptation = PEDAGOGICAL_TEMPLATES[grade_key].get(
            lang_key, 
            "ସୂର୍ଯ୍ୟଙ୍କ ତାପରେ ପାଣି ଗରମ ହୋଇ ବାଷ୍ପ ପାଲଟିଯାଏ । ଏହାକୁ ଆମେ ବାଷ୍ପୀଭବନ ବୋଲି କୁହାଯାଏ ।"
        )

        key_points = [
            "Sun heats water and changes it into water vapour.",
            "Water vapour rises up and cools to form clouds.",
            "Clouds bring rain back to rivers and lakes."
        ]

        return {
            "pedagogical_adaptation": adaptation,
            "key_points": key_points,
            "grade_level": grade,
            "subject": subject
        }

pedagogy_service = PedagogyService()
