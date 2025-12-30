import React, { useState, useEffect } from 'react';
import { getImageUrlWithFallback } from '../../utils/imageUtils';
import './PropertyPhotos.css';

const PropertyPhotos = ({ property, onNavigate }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // All properties data with images from their respective folders
  const allProperties = {
    1: {
      id: 1,
      title: "2-BR • Princess Tower",
      area: "Dubai Marina",
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      beds: 3,
      price: 220,
      rating: 4.8,
      dtcm: "DUB-PRI-YJVVG",
      featured: true,
      new: true,
      images: [
        // Living Room Images
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/12996379-3a7c-46ce-bb22-678686ede8f9.jpeg",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/2384c853-b9d4-426a-837d-bcd7d3857fb8.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/2888347b-5c04-494e-af82-8d4ad6decd5b.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/37272c9f-acf9-445e-b387-4b47eae7b50f.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/53328143-3754-473d-b80d-dd50bc93b3bb.jpeg",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/53404ea3-5a99-4bc3-9cef-a0ff8b6f4071.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/6f108955-6072-458c-9036-6f7d84946aa0.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/7fb70c61-6d8e-4259-8f2a-fb3f5ad93705.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/921e9809-51a8-4354-8752-c2bfb6293689.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/d1ff2713-d44e-47a7-b314-ee10f7e92850.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Living Room/dd19c01f-1e10-4a0b-870f-36428c76b4d2.jpeg",

        // Bedroom 1 Images
        "/2BR in Princess Tower  Furnished  Close to Metro/BR1/188031da-df38-49ab-ac71-ccdd65a7c1e4.jpeg",
        "/2BR in Princess Tower  Furnished  Close to Metro/BR1/18dd0183-b98c-43b7-ade7-cf40e8cb40f9.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/BR1/4f9c3cc5-a5e4-4bd5-a37a-bea70f2d19a8.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/BR1/523150b9-19d3-45fd-aa8b-58d70d60ba56.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/BR1/5d7888e5-f563-4e46-844e-cae6ee9eab4b.avif",

        // Bedroom 2 Images
        "/2BR in Princess Tower  Furnished  Close to Metro/BR2/027f21fd-508e-4174-a894-fe6eb0a9b03e.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/BR2/2479f095-e549-4208-9f24-189906d73efe.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/BR2/6bfa0b99-6311-4df1-8c62-036db358498f.jpeg",
        "/2BR in Princess Tower  Furnished  Close to Metro/BR2/c07fb509-8b34-46c4-a977-05de26559633.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/BR2/c8516ca1-6792-4703-bd02-521d35e0862b.avif",

        // Kitchen Images
        "/2BR in Princess Tower  Furnished  Close to Metro/kitchen/01695d3d-0834-4278-8fb7-4e894ba2f90c.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/kitchen/f3609b97-580e-442c-a4de-ee5451820042.avif",

        // Balcony Images
        "/2BR in Princess Tower  Furnished  Close to Metro/Balcony/0122b155-7516-46f9-b4d0-d86d930260e0.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Balcony/303c3ae4-b3ba-4b74-b3f6-5db38f134707.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Balcony/6c873a87-3972-4b68-a78b-4240b7d4ff62.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Balcony/d4515d2f-90e3-417d-9fbc-b6c4f35a2c59.jpeg",

        // Dining Room Images
        "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/0228c67d-90b3-4b4f-bf8e-37c57f9f58a4.jpeg",
        "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/0d30c8e1-ed10-49b3-aac2-1c426f5f575c.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/21179480-837d-472e-9f74-5b0789150607.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/a5e52420-17a8-4fc4-907e-dea30ed31064.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/a78a0936-19ea-4a57-b98b-0363e397bbfb.jpeg",
        "/2BR in Princess Tower  Furnished  Close to Metro/Dinning Room/be92771a-630d-413f-ae6c-182ec4342ae6.jpeg",

        // Bathroom 1 Images
        "/2BR in Princess Tower  Furnished  Close to Metro/Bathroom 1/3e9b7f83-4a3e-42df-8760-c036b8fe79e1.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Bathroom 1/9146b978-86ec-4ca9-8875-838b009b6df0.avif",

        // Bathroom 2 Images
        "/2BR in Princess Tower  Furnished  Close to Metro/Bathroom2/10590021-6aa7-478b-8981-c6a8dc76655e.avif",

        // Other Pictures
        "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/1f543d1b-b1c5-48a1-8a5a-ff32903e6586.jpeg",
        "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/8f6adf3c-23a4-46a1-b3ef-d00259b29dda.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/cd388680-f4d7-402f-9a76-f27db853c2c8.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/d869b25f-343f-417e-9c89-74749a71d0b8.avif",
        "/2BR in Princess Tower  Furnished  Close to Metro/Otherpics/effc3776-654e-48f3-8343-0b47334ed1bf.avif"
      ],
      location: "Princess Tower, Dubai Marina"
    },
    2: {
      id: 2,
      title: "Bright & Comfy 2-BR • Dorra Bay",
      area: "Dubai Marina",
      bedrooms: 2,
      bathrooms: 2,
      guests: 6,
      beds: 3,
      price: 180,
      rating: 4.7,
      dtcm: "MAR-DOR-5FBLR",
      featured: false,
      new: true,
      images: [
        // Living Room Images
        "/Bright & comfy 2br Dora Bay/Living room/ecc6e4ef-e452-49af-9b6e-d55532116fff.avif",
        "/Bright & comfy 2br Dora Bay/Living room/9d92d42c-6062-4523-9625-2d09fb9276a3.avif",
        "/Bright & comfy 2br Dora Bay/Living room/6c7fc83b-6d6b-49d0-813d-b1382926aa09.avif",
        "/Bright & comfy 2br Dora Bay/Living room/4162bc75-7daa-4c38-b1ee-1a07fe7bb0a4.avif",
        "/Bright & comfy 2br Dora Bay/Living room/33e2f997-4c32-49f0-97ba-529bc8dea112.avif",
        "/Bright & comfy 2br Dora Bay/Living room/301099c8-2a11-498a-a096-155cf0a3a724.avif",
        "/Bright & comfy 2br Dora Bay/Living room/0ff58bc5-ec1f-4c92-ac95-75812ebbcb45.avif",

        // Kitchen Images
        "/Bright & comfy 2br Dora Bay/Full kitchen/9132687b-9f37-48ab-bc9a-50e42a6e67e6.avif",
        "/Bright & comfy 2br Dora Bay/Full kitchen/5690134c-bea5-4d0c-bd3a-94283cf06da2.avif",

        // Exterior Images
        "/Bright & comfy 2br Dora Bay/Exterior/f6bd5388-2c1c-4780-9550-92974e17bca3.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/ea9188b7-9010-474f-a7b0-0c1c5692be32.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/bd3cdf83-7321-420f-9bf6-a61dad81207f.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/ba154dcb-3882-4407-add7-2ebb6741e147.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/b2274c86-d914-4839-9f1e-4155d4bcbe08.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/9d6ecb18-2988-4f52-bd49-df2ac34f683e.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/89a38793-026e-4e71-a497-b66c016ec386.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/6af9353a-cc06-4f45-8fcb-a85d0938f204.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/5b6c7b87-2e88-4f2a-9179-a27eb7b691f7.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/4fc4803d-d188-4e28-a927-1d97d090bac3.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/330bcc0e-6770-4045-b049-ac3e52883aa1.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/2a6f57ee-dfef-4f88-9296-29ccef1f22e4.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/1f97ae37-0505-4755-9bcd-a68f24be0f6d.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/1cb10dbc-379f-4d4d-b568-718a8f2123a0.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/1ae39528-6955-45b2-8b6d-72c2b0b24056.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/12671033-e362-47d9-83b7-ba6ad8b11b06.avif",
        "/Bright & comfy 2br Dora Bay/Exterior/06938194-63f7-458e-9781-ea4dea29fd89.avif",

        // Dining Area Images
        "/Bright & comfy 2br Dora Bay/Dining area/9b858277-a2a7-46cc-a7d8-de5b7897277b.avif",
        "/Bright & comfy 2br Dora Bay/Dining area/940e1780-a6f8-4f69-9f6b-1dd8e04d49df.avif",
        "/Bright & comfy 2br Dora Bay/Dining area/6a7faba3-5b09-467c-bcd9-2d3458c6af6d.avif",
        "/Bright & comfy 2br Dora Bay/Dining area/652798c4-7b30-4dc0-bba7-e725a0a2ad32.avif",
        "/Bright & comfy 2br Dora Bay/Dining area/4ae84e36-60f9-496b-825e-54dd12f07621.avif",
        "/Bright & comfy 2br Dora Bay/Dining area/1ff3364f-6d8e-4aa8-8f89-1117ee225db8.avif",

        // Bedroom Images
        "/Bright & comfy 2br Dora Bay/BR2/a1c02b76-9495-4cd1-9473-b46740009e18.avif",
        "/Bright & comfy 2br Dora Bay/BR2/92a960bb-6df2-4d1d-9348-228627455cf4.avif",
        "/Bright & comfy 2br Dora Bay/BR2/8e9cafc4-2b75-41e2-958c-3a3caeb8858e.avif",
        "/Bright & comfy 2br Dora Bay/BR2/86661bc8-56b7-4f29-bc5f-6642a40b5ea0.avif",
        "/Bright & comfy 2br Dora Bay/BR1/c02ea5ae-0cc2-48b6-9696-a6af136c1bbd.avif",
        "/Bright & comfy 2br Dora Bay/BR1/9ccb866f-e5ef-4beb-a22b-ee997c6bc211.avif",
        "/Bright & comfy 2br Dora Bay/BR1/63a04f0a-404c-458f-bbe7-848a9eb195b4.avif",
        "/Bright & comfy 2br Dora Bay/BR1/19e53c20-071e-4b1b-aabf-c65f2815002d.avif",

        // Bathroom Images
        "/Bright & comfy 2br Dora Bay/Bathroom 1/aaef0a74-7ead-4182-a5ac-d6c606ee51ba.avif",
        "/Bright & comfy 2br Dora Bay/Bathroom 1/a21854b0-ff78-40f3-96e8-0f4622c97fb5.avif",
        "/Bright & comfy 2br Dora Bay/Bathroom 1/364d20a2-2994-4cfe-a450-a5673a668154.avif",
        "/Bright & comfy 2br Dora Bay/Bathroom2/2064cf6a-f0b4-4ec5-ae3f-045a51a90c89.jpeg"
      ],
      location: "Dorra Bay, Dubai Marina"
    },
    3: {
      id: 3,
      title: "Family-Friendly 2-BR • Princess Tower",
      area: "Dubai Marina",
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      beds: 3,
      price: 200,
      rating: 4.6,
      dtcm: "DUB-PRI-PPLD4",
      featured: false,
      new: false,
      images: [
        // Living Room Images
        "/Family friendly 2BR/Living room/f05aa337-0afb-488e-a2b8-d45672cdd1cf.jpeg",
        "/Family friendly 2BR/Living room/e9338d33-33c3-40b7-8ffe-f49c96c6a419.avif",
        "/Family friendly 2BR/Living room/e5347e8f-853f-42a9-b554-beb759d94331.jpeg",
        "/Family friendly 2BR/Living room/dbd110f3-beb7-4a0f-a16d-5ef1e1cf8359.jpeg",
        "/Family friendly 2BR/Living room/c25c6ee5-cf09-43a0-a650-68617d95a935.avif",
        "/Family friendly 2BR/Living room/c0d5c348-6cea-4fef-bf33-b7e7ecbc7a8c.avif",
        "/Family friendly 2BR/Living room/ab489fd2-98c1-4fc3-b39a-e69c1e0d356e.jpeg",
        "/Family friendly 2BR/Living room/7f0e5bf2-7305-4593-8e73-556bc347983a.jpeg",
        "/Family friendly 2BR/Living room/7e259d6d-d5f6-46e6-95aa-94892ec40b3f.avif",
        "/Family friendly 2BR/Living room/7b75f281-c503-4dac-ae34-c833cd734fb4.avif",
        "/Family friendly 2BR/Living room/36942c8a-5a6f-458f-b8d0-8e138a064ed8.jpeg",
        "/Family friendly 2BR/Living room/01edd577-cb56-4845-aed0-f127c2945f66.avif",
        "/Family friendly 2BR/Living room/019dc95c-c729-483a-96d6-a128b6f687f2.avif",

        // Kitchen Images
        "/Family friendly 2BR/Full kitchen/6d2380e7-292a-49a4-8eaf-2c8f582dcbef.avif",
        "/Family friendly 2BR/Full kitchen/49d859af-f75a-4849-a1c8-3a893b0526e2.avif",

        // Exterior Images
        "/Family friendly 2BR/Exterior/fa83af28-cfae-4f9e-9091-e37377b868bd.avif",
        "/Family friendly 2BR/Exterior/e594bdd0-56aa-4e70-a7a2-8e4b92408ffc.avif",
        "/Family friendly 2BR/Exterior/a5beebd3-cc74-4e31-b9fe-f9db2753fce1.avif",
        "/Family friendly 2BR/Exterior/883bd66a-f94d-4b2f-b5d3-0c5f7e094f0f.avif",
        "/Family friendly 2BR/Exterior/7ce184ec-90cc-4e75-aed5-e0af6424ea1f.avif",
        "/Family friendly 2BR/Exterior/0b61a92d-5129-4c9a-83b8-952da8252d11.avif",
        "/Family friendly 2BR/Exterior/0a2c520f-bf3d-48ee-b9df-356c719032ea.avif",

        // Dining Area Images
        "/Family friendly 2BR/Dining area/eee92da9-a158-4b87-b788-d3b7b1ae16ad.jpeg",
        "/Family friendly 2BR/Dining area/ddfc5064-ec30-4943-9f0e-2a86fa27bdf9.jpeg",
        "/Family friendly 2BR/Dining area/d53d7b71-6681-46ee-a013-08c4f2a64e06.jpeg",
        "/Family friendly 2BR/Dining area/ce52f158-6234-48bc-be41-826887879d6f.avif",
        "/Family friendly 2BR/Dining area/bc3d36bb-ea97-4c92-953a-6067f5f011af.jpeg",
        "/Family friendly 2BR/Dining area/7aa6395f-4bcd-4a3b-94b1-ebe575999400.avif",
        "/Family friendly 2BR/Dining area/5fb366c4-786c-47c9-bc34-07f2e5d3f4df.avif",
        "/Family friendly 2BR/Dining area/41b02c00-8bee-49d1-9b6b-3d7051619186.jpeg",
        "/Family friendly 2BR/Dining area/24499d61-5c65-4d48-85eb-8fbb6f1bc05b.avif",

        // Bedroom Images
        "/Family friendly 2BR/BR2/f38361b6-aee1-4040-8438-1fe8d33e28c0.avif",
        "/Family friendly 2BR/BR2/a6d803e9-79db-4932-923d-2b764910d52b.avif",
        "/Family friendly 2BR/BR2/66f0eab8-3ea7-41c1-a4a4-39920bf05ff4.avif",
        "/Family friendly 2BR/BR2/58879bb3-eddf-4553-90a0-94ed7152f969.jpeg",
        "/Family friendly 2BR/BR2/43c94ec1-2bbf-40ac-ac7d-23aeee08680c.avif",
        "/Family friendly 2BR/BR2/23b7f932-754d-4806-a03b-313f01a74ff0.jpeg",
        "/Family friendly 2BR/BR1/fc64acdd-297d-401e-9943-cf74f49fccf1.avif",
        "/Family friendly 2BR/BR1/e334b808-cb90-4602-8489-a804114ab07b.jpeg",
        "/Family friendly 2BR/BR1/8dc260e3-f12b-4dad-bde1-ebcab7f9629d.avif",
        "/Family friendly 2BR/BR1/4165a448-f9c0-4a45-997e-29685c1b7434.avif",
        "/Family friendly 2BR/BR1/3382abd4-38b1-488d-8172-86463c3700e9.avif",
        "/Family friendly 2BR/BR1/2b59624d-f4b7-4bac-9a19-4c476ff58ba4.jpeg",
        "/Family friendly 2BR/BR1/0b4b2bee-acb3-4a20-8840-7c25e3430091.avif",

        // Bathroom Images
        "/Family friendly 2BR/Bathroom2/c4d201bb-6468-4da4-a44b-cbf0c121863c.avif",
        "/Family friendly 2BR/Bathroom2/7b30349b-6dfa-4781-bcde-811ed8cf3261.avif",
        "/Family friendly 2BR/Bathroom 1/ea628f90-3aa8-4ee2-b68b-86aeb4d2844a.jpeg",
        "/Family friendly 2BR/Bathroom 1/8f6c37fc-571f-4316-a78d-dbf360d7951a.avif"
      ],
      location: "Princess Tower, Dubai Marina"
    },
    4: {
      id: 4,
      title: "Higher-Floor 2-BR • Princess Tower",
      area: "Dubai Marina",
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      beds: 3,
      price: 250,
      rating: 4.9,
      dtcm: "DUB-PRI-EOMBJ",
      featured: true,
      new: false,
      images: [
        // Living Room Images
        "/Higher floor 2br princess tower/Living room/eec2cc4f-a6c4-45df-ae1f-e29c1ee66256.jpeg",
        "/Higher floor 2br princess tower/Living room/a8d672b2-9d28-4e25-b8b3-906e0e1113df.avif",
        "/Higher floor 2br princess tower/Living room/86f0869b-c5b3-4a9d-80ac-9fc1f2aa9204.avif",
        "/Higher floor 2br princess tower/Living room/79416c0f-d5ce-4e58-a56f-5e6167e15811.avif",
        "/Higher floor 2br princess tower/Living room/6b5738e8-3636-4293-b324-3bf5586beb17.avif",
        "/Higher floor 2br princess tower/Living room/640af4c4-37e2-4a69-a4b7-2dc6f8055df0.avif",
        "/Higher floor 2br princess tower/Living room/62e25314-db68-40e2-bdd2-134c27154169.jpeg",

        // Kitchen Images
        "/Higher floor 2br princess tower/Full kitchen/f4300ff1-381d-4352-af95-d015b1f6d0e9.avif",
        "/Higher floor 2br princess tower/Full kitchen/7223fb7f-3f3c-4f85-ac8f-5606f529e36a.avif",

        // Exterior Images
        "/Higher floor 2br princess tower/Exterior/f07375bc-9eba-41ac-826b-e672ffceff2b.avif",
        "/Higher floor 2br princess tower/Exterior/f06c8c7b-f869-4922-8e3d-2f195100260a.avif",
        "/Higher floor 2br princess tower/Exterior/b0f54e03-4bc0-469c-9c5f-770a45c6a1ec.avif",
        "/Higher floor 2br princess tower/Exterior/a4604fdd-b884-45ca-8ee2-88547ac855d5.avif",
        "/Higher floor 2br princess tower/Exterior/959a22d9-be01-4fb8-9de9-5d6444dd7206.avif",
        "/Higher floor 2br princess tower/Exterior/5ccecc3a-e1ac-4139-b605-a9a2f8f6408b.jpeg",
        "/Higher floor 2br princess tower/Exterior/1cf986fc-09c7-49ac-bc20-220e4c7fc7ee.avif",
        "/Higher floor 2br princess tower/Exterior/1625a4bf-dd53-4bd1-93a2-2fd717b3d686.avif",
        "/Higher floor 2br princess tower/Exterior/06db63a7-8df3-4c6a-a388-4241984d26a9.jpeg",
        "/Higher floor 2br princess tower/Exterior/0691774f-41bb-45c5-9c9d-e856f66b152a.avif",

        // Dining Area Images
        "/Higher floor 2br princess tower/Dining area/e5b1db53-18e2-4fba-8d20-ea78b2d2b203.avif",
        "/Higher floor 2br princess tower/Dining area/c347de82-dd0d-41ee-8f98-0f051f3a4347.avif",
        "/Higher floor 2br princess tower/Dining area/61672e83-cb3b-46f1-8fe1-6f079de75252.avif",

        // Bedroom Images
        "/Higher floor 2br princess tower/BR2/d27bbeac-99ff-4546-a7a2-336b3a0b1879.avif",
        "/Higher floor 2br princess tower/BR2/d15a3157-d3b7-4398-93b9-7fbdae823584.avif",
        "/Higher floor 2br princess tower/BR2/bf9a584d-53b4-435e-a06d-1887fe5a4413.avif",
        "/Higher floor 2br princess tower/BR2/731615b1-8fb4-4892-9438-a66345d40e3d.avif",
        "/Higher floor 2br princess tower/BR2/63d82393-3b3f-4c2e-acd8-e0ab8c947ce1.avif",
        "/Higher floor 2br princess tower/BR2/149f712f-f3d8-491f-aa92-b100b300cd19.jpeg",
        "/Higher floor 2br princess tower/BR1/d58e9ec5-122a-43d0-a634-91292872d362.avif",
        "/Higher floor 2br princess tower/BR1/3c53a13c-ba96-4ec6-b458-573308e1166f.avif",
        "/Higher floor 2br princess tower/BR1/2a4190c5-38f5-4634-8c93-342fa74899d1.avif",
        "/Higher floor 2br princess tower/BR1/14239239-affc-421d-948d-961c9253d68c.jpeg",

        // Bathroom Images
        "/Higher floor 2br princess tower/Bathroom2/ec247d1d-f194-4e54-8193-e3ac34583f52.avif",
        "/Higher floor 2br princess tower/Bathroom2/4e68de71-ac58-4b46-a827-49ac036994cd.avif",
        "/Higher floor 2br princess tower/Bathroom 1/eb9ff4c4-1c59-42ed-91b0-cd499ef43eb6.avif"
      ],
      location: "Princess Tower, Dubai Marina"
    },
    5: {
      id: 5,
      title: "Cozy 2-BR • Marina Residence 2",
      area: "Palm Jumeirah",
      bedrooms: 2,
      bathrooms: 2,
      guests: 6,
      beds: 3,
      price: 190,
      rating: 4.5,
      dtcm: "PAL-MAR-IFZEN",
      featured: false,
      new: true,
      images: [
        // Living Room Images
        "/Marina residency tower 2/Living room/e56e7723-877e-47e3-b467-4125b5e194c6.avif",
        "/Marina residency tower 2/Living room/d133810a-3d24-4438-a280-31d42e1153bd.avif",
        "/Marina residency tower 2/Living room/a4d15101-4582-41d5-860e-30820c967f53.avif",
        "/Marina residency tower 2/Living room/8ad31bdd-b7f1-4fde-868a-607f1a7bd20e.avif",
        "/Marina residency tower 2/Living room/85a505d4-a5e9-4622-9ef3-ad8db3584b31.avif",
        "/Marina residency tower 2/Living room/66f59392-3132-4b00-841a-be6260f4ff0a.jpeg",
        "/Marina residency tower 2/Living room/5c958a4d-ac66-4584-b68b-25a015d64cad.avif",
        "/Marina residency tower 2/Living room/38c84517-fe56-433c-9ee2-dc6b851815da.avif",
        "/Marina residency tower 2/Living room/0111eadd-7b05-4a99-841d-100a4f6b1e2a.avif",

        // Kitchen Images
        "/Marina residency tower 2/Full kitchen/efc85719-5e26-49c3-b59a-b0905104b9f0.avif",
        "/Marina residency tower 2/Full kitchen/9a753bcb-e58e-44c4-b7fd-d6356bbb69b9.jpeg",
        "/Marina residency tower 2/Full kitchen/7c30deba-b07f-48ec-8db0-3b5f6d059302.avif",

        // Exterior Images
        "/Marina residency tower 2/Exterior/f5bb1028-0683-4a4a-8d19-4c03376af976.jpeg",
        "/Marina residency tower 2/Exterior/e70ee6bf-a732-4196-a777-c53092dc90da.jpeg",
        "/Marina residency tower 2/Exterior/cecd5ec6-526d-4d11-9dbd-98ec99510b61.jpeg",
        "/Marina residency tower 2/Exterior/c273165a-5913-42a8-89bc-777d948ec019.jpeg",
        "/Marina residency tower 2/Exterior/aee73815-794e-4e6d-b935-4143bb863d7e.avif",
        "/Marina residency tower 2/Exterior/9040c541-1948-4e19-986e-b6df1f41673b.avif",
        "/Marina residency tower 2/Exterior/73de2f5b-4513-4cf9-8e14-e3cd3c61a60c.avif",
        "/Marina residency tower 2/Exterior/57ce3e45-e476-4444-8a23-47442bbe1429.avif",
        "/Marina residency tower 2/Exterior/46b2efa4-e9a3-44b9-b332-866d33e4a6fd.avif",
        "/Marina residency tower 2/Exterior/20191393-5063-4012-a331-9f25e055429a.avif",
        "/Marina residency tower 2/Exterior/1183ddb2-87ae-4395-81f2-6e0c0944f57e.jpeg",
        "/Marina residency tower 2/Exterior/0edf687a-e954-4ee8-919b-af8577701fc3.avif",
        "/Marina residency tower 2/Exterior/0b0b4845-b6ea-4bf9-93be-e8f5a8aa17d9.avif",

        // Dining Area Images
        "/Marina residency tower 2/Dining area/3b10c210-adff-466c-8db6-134c998eeb50.avif",

        // Bedroom Images
        "/Marina residency tower 2/BR2/cca605a3-d170-4b55-9f81-b990c0803c61.avif",
        "/Marina residency tower 2/BR2/64662e92-d00a-4237-a79f-ca8dca988157.jpeg",
        "/Marina residency tower 2/BR2/57f183de-ff1b-4e07-acef-7426e0d7692f.avif",
        "/Marina residency tower 2/BR1/de98f0a1-8ee9-481c-842c-bf4342c08799.jpeg",
        "/Marina residency tower 2/BR1/da7aa125-4775-4218-a04e-5df5c4b2d3bb.avif",
        "/Marina residency tower 2/BR1/578706d0-8963-4cfa-a62c-d8e3a6ed9f2d.avif",
        "/Marina residency tower 2/BR1/2f845262-e65a-437c-8c09-da9884fb0625.jpeg",

        // Bathroom Images
        "/Marina residency tower 2/Bathroom2/34726e9a-c2e9-495c-8b47-1456591f26a1.avif",
        "/Marina residency tower 2/Bathroom2/2479bd31-2ee2-4877-bc9d-0a5365ac850d.avif",
        "/Marina residency tower 2/Bathroom 1/e92bf9c4-6439-4469-a8f3-6e2aa8999778.jpeg",
        "/Marina residency tower 2/Bathroom 1/a4e934dc-318d-437b-b515-de8216c5594d.jpeg",
        "/Marina residency tower 2/Bathroom 1/39cd7e56-b730-4b53-88e1-ba7f3644f8e7.avif"
      ],
      location: "Marina Residence 2, Palm Jumeirah"
    },
    6: {
      id: 6,
      title: "Modern 2-BR Urban Retreat",
      area: "Prime Dubai Location",
      bedrooms: 2,
      bathrooms: 1,
      guests: 4,
      beds: 2,
      price: 160,
      rating: 4.4,
      dtcm: "URB-RET-ABC123",
      featured: false,
      new: true,
      images: [
        // Living Room Images
        "/Urban retreat/Living room/e6e8156a-5aca-4a12-8ab4-edd855cd5885.avif",
        "/Urban retreat/Living room/e0110fc2-6f32-4494-8849-def85c6ca0e3.avif",
        "/Urban retreat/Living room/87d3c2b9-2247-4a49-b7ac-7180086497bd.avif",
        "/Urban retreat/Living room/7d8f385d-d8bf-45f7-94fd-52565748fd03.jpeg",
        "/Urban retreat/Living room/5a9bcc96-de23-4e59-9ed1-f9cd3bb6b1d5.jpeg",

        // Kitchen Images
        "/Urban retreat/Full kitchen/5f34cb21-ab82-4a39-80ca-2a57b411ae45.jpeg",

        // Exterior Images
        "/Urban retreat/Exterior/e3f28bb6-8085-4cff-96bc-119a71a427fb.jpeg",
        "/Urban retreat/Exterior/e0ef78c6-b615-4c1f-9597-424a0a3aceea.jpeg",
        "/Urban retreat/Exterior/a2d20ba9-291c-469e-ab1d-ef5322dcc5be.jpeg",
        "/Urban retreat/Exterior/9a9b89c2-191d-44c8-a408-eb07144e7411.jpeg",
        "/Urban retreat/Exterior/84a3789d-1fcc-4eaf-b731-7aef8f3581af.jpeg",
        "/Urban retreat/Exterior/5eda3975-9f8d-4409-b5b6-e45d9ad7dadd.avif",
        "/Urban retreat/Exterior/042aa7fa-b004-4569-9667-9e9096f8530b.jpeg",

        // Dining Area Images
        "/Urban retreat/Dining area/ecc230e9-2a90-4bf0-a6b3-a273b023ac92.jpeg",
        "/Urban retreat/Dining area/dbbe6448-7b4b-45f6-b2fc-d3373d4c1562.jpeg",
        "/Urban retreat/Dining area/5edce792-e4d7-4b1f-a697-664e9dfef76b.avif",
        "/Urban retreat/Dining area/5911875f-f8a8-4967-a798-860f93c24e91.avif",
        "/Urban retreat/Dining area/3b49e856-3eaf-45fe-82b4-a5bdf00a13bf.jpeg",
        "/Urban retreat/Dining area/271d45ea-35b8-417a-8f33-3d45f996054c.avif",

        // Bedroom Images
        "/Urban retreat/BR2/fb9dda3b-5f0f-4782-a44e-44f2e7e83291.jpeg",
        "/Urban retreat/BR2/f53c5416-9559-4674-8bd9-129708f43a84.jpeg",
        "/Urban retreat/BR2/e8abaf64-b18f-485c-a401-cbce6d1b63bd.avif",
        "/Urban retreat/BR2/dd1360dc-e27e-499c-9ca9-447c68fed2ff.jpeg",
        "/Urban retreat/BR2/d2a4df23-8b64-4f4e-be90-72ad16956957.avif",
        "/Urban retreat/BR2/8347969d-1607-4c59-8719-bcd0b39f2c87.avif",
        "/Urban retreat/BR1/d5dcddcf-8a45-44fc-b1cb-3301939f12c7.avif",
        "/Urban retreat/BR1/757cab17-ac26-41f1-8c6e-760ef74560ec (1).jpeg",
        "/Urban retreat/BR1/6704ebde-27a2-43a7-8f68-ccd9906e0daa.avif",
        "/Urban retreat/BR1/40c869fa-b3ac-4570-900e-55d35a6c016f.avif",
        "/Urban retreat/BR1/00a87f95-1859-4f93-adac-1bc4200b2d6e.jpeg",
        "/Urban retreat/BR1/0007c13d-ed47-4f10-a4b1-c273dafe40ca.jpeg",

        // Bathroom Images
        "/Urban retreat/Bathroom 1/757cab17-ac26-41f1-8c6e-760ef74560ec.jpeg",
        "/Urban retreat/Bathroom 1/459c05db-0fd9-4233-ad55-4645c85b09ae.jpeg",
        "/Urban retreat/Bathroom 1/311b89eb-2da4-434f-9740-458666123958.jpeg",
        "/Urban retreat/Bathroom 1/1e0b7383-3ba3-445e-a449-836b579f5ee2.jpeg"
      ],
      location: "Urban Retreat, Prime Dubai Location"
    },
    7: {
      id: 7,
      title: "Luxurious & Elegant 2BR near Burj Khalifa • Standpoint Tower A",
      area: "Downtown Dubai",
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      beds: 3,
      price: 1800,
      rating: 5,
      dtcm: "DOW-STA-51PDN",
      featured: true,
      new: true,
      images: [
        "/downtown-standpoint-tower/living-room/286952df-362f-44c6-8e40-717697937f95.avif",
        "/downtown-standpoint-tower/bedroom-1/2eb77e31-56cb-4ea3-af60-0d92560ff268.avif",
        "/downtown-standpoint-tower/bedroom-2/06664f70-91dc-4013-b2fe-6aae1f7e8417.avif",
        "/downtown-standpoint-tower/kitchen/39b1c808-2511-4918-957f-f6819e539dc8.avif",
        "/downtown-standpoint-tower/balcony/213690ff-21a8-43c1-8cbc-121c887da372.avif",
        "/downtown-standpoint-tower/balcony/b1.jpeg",
        "/downtown-standpoint-tower/balcony/b2.jpeg"
      ],
      location: "Standpoint Tower A, Downtown Dubai"
    }
  };

  // Get the current property data - prioritize API data over hardcoded
  const getPropertyData = () => {
    // Priority 1: Use local data for images if available to ensure correct categorization and sequence
    if (property && property.id && allProperties[property.id]) {
      return {
        ...allProperties[property.id], // Base on local data
        ...property, // Override with dynamic data (price, availability)
        images: allProperties[property.id].images, // FORCE local images
        title: property.title || allProperties[property.id].title,
        location: property.location || allProperties[property.id].location
      };
    }

    // Priority 2: Use API/Prop data if available
    if (property && property.images && property.images.length > 0) {
      return {
        ...property,
        title: property.title || 'Property',
        location: property.location || 'Location not specified'
      };
    }

    // Priority 3: Fallback (Princess Tower)
    return {
      ...allProperties[1],
      ...property,
      images: allProperties[1].images,
      title: property.title || allProperties[1].title,
      location: property.location || allProperties[1].location
    };
  };

  const mockProperty = getPropertyData();

  // Ensure we have images
  if (!mockProperty.images || mockProperty.images.length === 0) {
    console.warn('No images found for property:', mockProperty.title);
    mockProperty.images = allProperties[1]?.images || []; // Fallback to Princess Tower images
  }

  // Helper function to extract category from image path/URL
  const getImageCategory = (imagePath) => {
    if (!imagePath) return 'Other';

    const pathStr = typeof imagePath === 'string' ? imagePath : '';

    // Check for category keywords in the path
    if (pathStr.includes('Living Room') || pathStr.includes('Living room') || pathStr.includes('living-room')) {
      return 'Living Room';
    }
    if (pathStr.includes('BR1') || pathStr.includes('Bedroom 1') || pathStr.includes('bedroom-1')) {
      return 'Bedroom 1';
    }
    if (pathStr.includes('BR2') || pathStr.includes('Bedroom 2') || pathStr.includes('bedroom-2')) {
      return 'Bedroom 2';
    }
    if (pathStr.includes('kitchen') || pathStr.includes('Kitchen') || pathStr.includes('Full kitchen')) {
      return 'Kitchen';
    }
    if (pathStr.includes('Dinning Room') || pathStr.includes('Dining area') || pathStr.includes('Dining Room')) {
      return 'Dining Room';
    }
    if (pathStr.includes('Bathroom 1') || pathStr.includes('bathroom-1')) {
      return 'Bathroom 1';
    }
    if (pathStr.includes('Bathroom2') || pathStr.includes('bathroom-2')) {
      return 'Bathroom 2';
    }
    if (pathStr.includes('Balcony') || pathStr.includes('balcony')) {
      return 'Balcony';
    }
    if (pathStr.includes('Exterior') || pathStr.includes('exterior')) {
      return 'Exterior';
    }
    if (pathStr.includes('Otherpics') || pathStr.includes('Other')) {
      return 'Other';
    }

    return 'Other';
  };

  // Organize images by category
  const imageCategories = {
    all: mockProperty.images,
    'Living Room': mockProperty.images.filter(img => getImageCategory(img) === 'Living Room'),
    'Bedroom 1': mockProperty.images.filter(img => getImageCategory(img) === 'Bedroom 1'),
    'Bedroom 2': mockProperty.images.filter(img => getImageCategory(img) === 'Bedroom 2'),
    'Kitchen': mockProperty.images.filter(img => getImageCategory(img) === 'Kitchen'),
    'Dining Room': mockProperty.images.filter(img => getImageCategory(img) === 'Dining Room'),
    'Bathroom 1': mockProperty.images.filter(img => getImageCategory(img) === 'Bathroom 1'),
    'Bathroom 2': mockProperty.images.filter(img => getImageCategory(img) === 'Bathroom 2'),
    'Balcony': mockProperty.images.filter(img => getImageCategory(img) === 'Balcony'),
    'Exterior': mockProperty.images.filter(img => getImageCategory(img) === 'Exterior'),
    'Other': mockProperty.images.filter(img => getImageCategory(img) === 'Other')
  };

  const currentImages = imageCategories[selectedCategory] || imageCategories.all;

  const handleImageClick = (index) => {
    setSelectedImage(index);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev + 1) % currentImages.length);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCloseLightbox();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'ArrowLeft') {
      handlePrevImage();
    }
  };

  useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  return (
    <div className="property-photos">
      {/* Header */}
      <div className="photos-header">
        <button
          className="back-btn"
          onClick={() => onNavigate('property-details', property)}
          aria-label="Back to property details"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="header-actions">
          <button className="share-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
          <button className="save-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Save
          </button>
        </div>
      </div>

      <div className="container">
        {/* Property Info */}
        <div className="property-info">
          <h1>{mockProperty.title}</h1>
          <p className="location">{mockProperty.location}</p>
        </div>

        {/* Photo Tour Section */}
        <div className="photo-tour-section">
          <h2>Photo tour</h2>

          {/* Category Grid */}
          <div className="category-grid">
            {Object.entries(imageCategories).filter(([category, images]) =>
              category !== 'all' && images.length > 0
            ).map(([category, images]) => (
              <div
                key={category}
                className="category-item"
                onClick={() => {
                  setSelectedCategory(category);
                  handleImageClick(0);
                }}
              >
                <img
                  src={getImageUrlWithFallback(images[0])}
                  alt={category}
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback to local path
                    const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
                    const imgPath = images[0];
                    if (imgPath && !imgPath.startsWith('http')) {
                      e.target.src = `${websiteUrl}${imgPath.startsWith('/') ? '' : '/'}${imgPath.replace(/^\.\//, '')}`;
                    }
                  }}
                />
                <div className="category-label">{category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All Photos by Category */}
        <div className="all-photos-section">
          {Object.entries(imageCategories).filter(([category, images]) =>
            category !== 'all' && images.length > 0
          ).map(([category, images]) => (
            <div key={category} className="category-section">
              <h3>{category}</h3>
              <div className="category-photos">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="category-photo"
                    onClick={() => {
                      setSelectedCategory(category);
                      handleImageClick(index);
                    }}
                  >
                    <img
                      src={getImageUrlWithFallback(image)}
                      alt={`${category} ${index + 1}`}
                      loading="lazy"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        // Fallback to local path
                        const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
                        if (image && !image.startsWith('http')) {
                          e.target.src = `${websiteUrl}${image.startsWith('/') ? '' : '/'}${image.replace(/^\.\//, '')}`;
                        }
                      }}
                    />
                    <div className="photo-label">{category} {index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* All Photos Grid (Fall back if categories miss images or to show everything) */}
        <div className="property-section all-images-grid" style={{ marginTop: '40px' }}>
          <h3>All Photos</h3>
          <div className="category-photos">
            {mockProperty.images.map((image, index) => (
              <div
                key={`all-${index}`}
                className="category-photo"
                onClick={() => {
                  setSelectedCategory('all');
                  handleImageClick(index);
                }}
              >
                <img
                  src={getImageUrlWithFallback(image)}
                  alt={`Property ${index + 1}`}
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback to local path
                    const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
                    if (image && !image.startsWith('http')) {
                      e.target.src = `${websiteUrl}${image.startsWith('/') ? '' : '/'}${image.replace(/^\.\//, '')}`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {isLightboxOpen && (
          <div className="lightbox" onClick={handleCloseLightbox}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={handleCloseLightbox}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <button className="lightbox-prev" onClick={handlePrevImage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button className="lightbox-next" onClick={handleNextImage}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <img
                src={getImageUrlWithFallback(currentImages[selectedImage])}
                crossOrigin="anonymous"
                onError={(e) => {
                  // Fallback to local path
                  const websiteUrl = import.meta.env.VITE_WEBSITE_URL || 'https://www.ygiholidayhomes.com';
                  const img = currentImages[selectedImage];
                  if (img && !img.startsWith('http')) {
                    e.target.src = `${websiteUrl}${img.startsWith('/') ? '' : '/'}${img.replace(/^\.\//, '')}`;
                  }
                }}
                alt={`${mockProperty.title} - ${selectedCategory} ${selectedImage + 1}`}
                className="lightbox-image"
              />

              <div className="lightbox-counter">
                {selectedImage + 1} / {currentImages.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPhotos;