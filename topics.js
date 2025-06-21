// List of topics
const topics = [
    { id: 'family', name: 'Từ vựng tiếng Anh cơ bản chủ đề gia đình', fileName: 'family_vocabulary.json' },
    { id: 'weather', name: 'Từ vựng tiếng Anh chủ đề thời tiết', fileName: 'weather_vocabulary.json' },
    { id: 'job', name: 'Từ vựng tiếng Anh chủ đề nghề nghiệp', fileName: 'job_vocabulary.json' },
    { id: 'clothes', name: 'Từ vựng tiếng Anh chủ đề quần áo đầy đủ nhất', fileName: 'clothes_vocabulary.json' },
    { id: 'character', name: 'Từ vựng tiếng Anh chủ đề tính cách', fileName: 'character_vocabulary.json' },
    { id: 'vegetable', name: 'Từ vựng tiếng Anh thông dụng chủ đề rau củ', fileName: 'vegetable_vocabulary.json' },
    { id: 'environment', name: 'Từ vựng tiếng Anh chủ đề môi trường', fileName: 'environment_vocabulary.json' },
    { id: 'animals', name: 'Từ vựng tiếng Anh cơ bản chủ đề con vật', fileName: 'animals_vocabulary.json' },
    { id: 'food', name: 'Từ vựng tiếng Anh giao tiếp chủ đề đồ ăn', fileName: 'food_vocabulary.json' },
    { id: 'school', name: 'Từ vựng tiếng Anh chủ đề trường học đầy đủ nhất', fileName: 'school_vocabulary.json' },
    { id: 'travel', name: 'Từ vựng tiếng Anh chủ đề du lịch', fileName: 'travel_vocabulary.json' },
    { id: 'color', name: 'Từ vựng tiếng Anh thông dụng chủ đề màu sắc', fileName: 'color_vocabulary.json' },
    { id: 'trafic', name: 'Từ vựng tiếng Anh chủ đề giao thông', fileName: 'trafic_vocabulary.json' },
    { id: 'feeling', name: 'Từ vựng tiếng Anh chủ đề cảm xúc', fileName: 'feeling_vocabulary.json' },
    { id: 'fruits', name: 'Từ vựng tiếng Anh cơ bản chủ đề hoa quả', fileName: 'fruits_vocabulary.json' },
    { id: 'work', name: 'Từ vựng tiếng Anh chủ đề công việc', fileName: 'work_vocabulary.json' },
    { id: 'christermas', name: 'Từ vựng tiếng Anh phổ biến về chủ đề giáng sinh', fileName: 'christermas_vocabulary.json' },
    { id: 'fashion', name: 'Từ vựng tiếng Anh chủ đề thời trang', fileName: 'fashion_vocabulary.json' },
    { id: 'middleautum', name: 'Từ vựng tiếng Anh chủ đề trung thu', fileName: 'middleautum_vocabulary.json' },
    { id: 'kitchen', name: 'Từ vựng tiếng Anh thông dụng chủ đề nhà bếp', fileName: 'kitchen_vocabulary.json' },
    { id: 'sport', name: 'Từ vựng tiếng Anh chủ đề các môn thể thao', fileName: 'sport_vocabulary.json' },
    { id: 'drink', name: 'Từ vựng tiếng Anh giao tiếp chủ đề thức uống', fileName: 'drink_vocabulary.json' },
    { id: 'descripbepeople', name: 'Từ vựng tiếng Anh chủ đề miêu tả người', fileName: 'descripbepeople_vocabulary.json' },
    { id: 'country', name: 'Từ vựng tiếng Anh thông dụng chủ đề quốc gia', fileName: 'country_vocabulary.json' }
];

// Bootstrap's built-in functionality handles the tab switching,
// so no additional JavaScript is needed for basic functionality.
// This file is mainly for storing the topic data.

console.log('Topics loaded:', topics);
