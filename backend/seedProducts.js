const mongoose = require('mongoose');
const Product = require('./models/product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kikoDB')
    .then(() => console.log('MongoDB Connected to Product Seeder...'))
    .catch(err => console.log('Database connection error:', err));

const kikoProducts = [
    // --- LIPS ---
    { 
        name: "3D Hydra Lipgloss", 
        price: 6210, 
        category: "LIPS", 
        image: "hydrategloss.png", 
        rating: 4.8, 
        stock: 50, 
        description: "Softening lip gloss for a shiny, plumped look. The soft texture feels wonderful, blending into the lips and leaving them smooth and radiant.",
        shades: ["01 Unicorn Ray", "02 Rosy Glow", "03 Bronze Touch", "04 Pink Orchid"],
        ingredients: "POLYBUTENE, OCTYLDODECANOL, SILICA DIMETHYL SILYLATE, OCTYLDODECYL STEAROYL STEARATE, TRIETHYLHEXANOIN, TRIISODECYL TRIMELLITATE, ISOCETYL STEARATE, DIISOSTEARYL MALATE."
    },
    { 
        name: "Smart Fusion Lipstick", 
        price: 2910, 
        category: "LIPS", 
        image: "smartlips.png", 
        rating: 4.5, 
        stock: 30, 
        description: "Rich and nourishing lipstick. Creamy texture leaving lips feeling soft and comfortable. Easy-to-apply formula with intense color pay-off.",
        shades: ["405 Vintage Rose", "407 Rosewood", "410 Coral", "414 Red Classic"],
        ingredients: "CAPRYLIC/CAPRIC TRIGLYCERIDE, BIS-DIGLYCERYL POLYACYLADIPATE-2, DIISOSTEARYL MALATE, SYNTHETIC WAX, HYDROGENATED POLYISOBUTENE, MICA, SILICA."
    },
    { 
        name: "Velvet Touch Lipstick", 
        price: 3700, 
        category: "LIPS", 
        image: "velvet.png", 
        rating: 4.2, 
        stock: 100, 
        description: "Moisturizing matte lipstick. Envelops the lips in a velvet veil of color, ensuring comfort and deep hydration all day long.",
        shades: ["311 Poppy Red", "312 Cherry", "315 Mauve", "316 Nude"],
        ingredients: "NEOPENTYL GLYCOL DICAPRYLATE/DICAPRATE, TRIMETHYLOLPROPANE TRIISOSTEARATE, SILICA, CERA MICROCRISTALLINA (MICROCRYSTALLINE WAX/CIRE MICROCRISTALLINE)."
    },
    { 
        name: "Velvet Passion Matte LipGloss", 
        price: 4200, 
        category: "LIPS", 
        image: "gloss.png", 
        rating: 4.6, 
        stock: 45, 
        description: "Comfortable matte liquid lip color with intense pigment. Glides on smoothly and locks in velvety matte color without drying the lips.",
        shades: ["01 Velvet Nude", "02 Passion Rose", "03 Crimson Classic", "04 Plum Royal"],
        ingredients: "ISODODECANE, MICA, DIMETHICONE, TRIMETHYLSILOXYSILICATE, POLYBUTENE, PETROLATUM, CYCLOHEXASILOXANE, DISTEARDIMONIUM HECTORITE."
    },
    { 
        name: "2 in 1 Creamy Gloss", 
        price: 4500, 
        category: "LIPS", 
        image: "creamygloss.png", 
        rating: 4.7, 
        stock: 15, 
        description: "Double action lip shine and color. Moisturizes like a balm, shines like a gloss, and delivers rich pigmentation.",
        shades: ["10 Peach Cream", "11 Strawberry", "12 Caramel Kiss"],
        ingredients: "OCTYLDODECANOL, DIISOSTEARYL MALATE, SILICA, POLYISOBUTENE, TOCOPHERYL ACETATE, PARFUM (FRAGRANCE)."
    },
    {
        name: "Creamy Lip Liner",
        price: 2100,
        category: "LIPS",
        image: "lipliner.png",
        rating: 4.3,
        stock: 80,
        description: "Smooth and precise lip pencil. Offers easy gliding and defining contours for long lasting lip color stay.",
        shades: ["01 Beige Wood", "02 Warm Rose", "03 Crimson Red", "04 Classic Nude"],
        ingredients: "MICA, SYNTHETIC WAX, POLYBUTENE, CERA ALBA, COPERNICIA CERIFERA CERA, TOCOPHEROL."
    },

    // --- EYES ---
    { 
        name: "Water Eyeshadow", 
        price: 4500, 
        category: "EYES", 
        image: "waterShadow.png", 
        rating: 4.7, 
        stock: 40, 
        description: "Revolutionary highly pigmented eyeshadow with instant color release for wet and dry use.",
        shades: ["200 Champagne", "208 Light Gold", "218 Grapefruit", "220 Emerald"],
        ingredients: "MICA, COCO-CAPRYLATE/CAPRATE, SILICA, GLYCERIN, MAGNESIUM STEARATE, SODIUM DEHYDROACETATE, TOCOPHEROL."
    },
    { 
        name: "Maxi Mod Mascara", 
        price: 5200, 
        category: "EYES", 
        image: "highMascara.png", 
        rating: 4.6, 
        stock: 60, 
        description: "Mascara with mini brush for maximum volume and definition. Highly black formulation.",
        shades: ["Black Mod"],
        ingredients: "AQUA (WATER/EAU), SYNTHETIC BEESWAX, PARAFFIN, ACACIA SENEGAL GUM, STEARIC ACID, PALMITIC ACID, COPERNICIA CERIFERA CERA."
    },
    { 
        name: "Lasting Precision Eyeliner", 
        price: 3200, 
        category: "EYES", 
        image: "brownliner.png", 
        rating: 4.4, 
        stock: 85, 
        description: "Automatic eye pencil for application on inner and outer eyelid. Long-lasting, water-resistant formula.",
        shades: ["01 Black", "02 Dark Brown", "03 Slate Grey", "04 Deep Blue"],
        ingredients: "CYCLOPENTASILOXANE, SYNTHETIC WAX, SILICA, TRIMETHYLSILOXYSILICATE, CERA MICROCRISTALLINA, MICA."
    },
    {
        name: "Ultra thin wand Mascara",
        price: 3800,
        category: "EYES",
        image: "thin.png",
        rating: 4.1,
        stock: 55,
        description: "Precision mascara with an ultra-thin wand for flawless definition and length. Reaches even the shortest lashes.",
        shades: ["Extra Black"],
        ingredients: "AQUA, COPAL, STEARIC ACID, ACRYLATES COPOLYMER, GLYCERIN, CAPRYLYL GLYCOL."
    },
    {
        name: "4 in 1 Eyeshadow",
        price: 5500,
        category: "EYES",
        image: "multiShadow.png",
        rating: 4.8,
        stock: 25,
        description: "Versatile 4-in-1 eyeshadow palette for highly pigmented eye looks. Easy to blend matte and metallic finishes.",
        shades: ["01 Earthy Neutrals", "02 Sunset Copper", "03 Smoky Quartz"],
        ingredients: "TALC, MICA, SYNTHETIC FLUORPHLOGOPITE, DIMETHICONE, ZINC STEARATE, POTASSIUM SORBATE."
    },
    {
        name: "Precision Eyebrow Pencil",
        price: 2800,
        category: "EYES",
        image: "browPencil.png",
        rating: 4.5,
        stock: 40,
        description: "Micro-precision pencil for defined brows. Comes with an integrated spoolie brush to blend color naturally.",
        shades: ["01 Blonde", "02 Brunette", "03 Dark Brown"],
        ingredients: "HYDROGENATED COCO-GLYCERIDES, COPERNICIA CERIFERA CERA, TOCOPHERYL ACETATE, LECITHIN."
    },
    {
        name: "High Pigment Eyeshadow",
        price: 3100,
        category: "EYES",
        image: "glitterShadow.png",
        rating: 4.2,
        stock: 70,
        description: "Highly pigmented wet and dry eyeshadow. Delivers an intense shimmer payoff with minimal fallout.",
        shades: ["101 Shimmer Gold", "104 Bronze Glam", "109 Emerald Satin"],
        ingredients: "TALC, SYNTHETIC FLUORPHLOGOPITE, MICA, ETHYLHEXYL PALMITATE, SILICA, MAGNESIUM STEARATE."
    },
    {
        name: "High Pigment multi Eyeshadow",
        price: 3400,
        category: "EYES",
        image: "multiShadow.png",
        rating: 4.0,
        stock: 50,
        description: "Multi-shade highly pigmented eyeshadow palette for dimensional eye makeup look designs.",
        shades: ["Palette 01 Earth", "Palette 02 Rosewood"],
        ingredients: "TALC, MICA, SILICA, OCTYLDODECYL STEAROYL STEARATE, SYNTHETIC WAX, PHENOXYETHANOL."
    },
    {
        name: "Ultra thick Mascara",
        price: 3000,
        category: "EYES",
        image: "standoutMascara.png",
        rating: 4.6,
        stock: 80,
        description: "Make your eyelashes ultra thick and voluminous. Bold black coat locks curls in place for hours.",
        shades: ["Carbon Black"],
        ingredients: "AQUA, PARAFFIN, IRON OXIDES (CI 77499), GLYCERIN, STEARIC ACID, PALMITIC ACID."
    },
    {
        name: "Suoer thind wand Mascara",
        price: 3500,
        category: "EYES",
        image: "superthinMascara.png",
        rating: 4.9,
        stock: 15,
        description: "Highly pigmented mascara with a super thin wand for maximum control, separation, and defining coat.",
        shades: ["Midnight Black"],
        ingredients: "AQUA, SYNTHETIC BEESWAX, PARAFFIN, ACACIA SENEGAL GUM, PHENOXYETHANOL."
    },

    // --- FACE ---
    { 
        name: "Ultra Glow strobe cream", 
        price: 7100, 
        category: "FACE", 
        image: "strobecream.png", 
        rating: 4.4, 
        stock: 25, 
        description: "Illuminating strobe cream for a radiant, ultra-glow finish. Hydrates and reflects light for dimensional shine.",
        shades: ["01 Gold Glow", "02 Pink Sparkle"],
        ingredients: "AQUA, CYCLOPENTASILOXANE, GLYCERIN, MICA, DIMETHICONE, TITANIUM DIOXIDE, TOCOPHERYL ACETATE."
    },
    { 
        name: "Radiant Touch Blush", 
        price: 4800, 
        category: "FACE", 
        image: "liquidblush.png", 
        rating: 4.5, 
        stock: 35, 
        description: "Luminous blush powder with a silky texture. Seamlessly blends to give cheeks a natural, radiant flush of color.",
        shades: ["101 Coral Rose", "103 Golden Peach", "105 Mauve Dream"],
        ingredients: "TALC, MICA, ZEA MAYS STARCH (ZEA MAYS (CORN) STARCH), DIMETHICONE, OCTYLDODECYL STEAROYL STEARATE."
    },
    { 
        name: "Weightless Powder Foundation", 
        price: 8500, 
        category: "FACE", 
        image: "facepowder.png", 
        rating: 4.9, 
        stock: 12, 
        description: "Wet & dry powder foundation with matte finish. Highly buildable cover, ideal for normal to oily skin types.",
        shades: ["01 Ivory", "03 Warm Beige", "05 Caramel"],
        ingredients: "TALC, MICA, SILICA, MAGNESIUM STEARATE, DIMETHICONE, ETHYLHEXYL METHOXYCINNAMATE."
    },
    {
        name: "Liquid Skin blush",
        price: 9200,
        category: "FACE",
        image: "skintint.png",
        rating: 4.7,
        stock: 18,
        description: "Second-skin effect liquid blush for a natural flush. Easy to blend water-based formula.",
        shades: ["01 Natural Rose", "02 Soft Peach", "03 Warm Terracotta"],
        ingredients: "AQUA, CYCLOPENTASILOXANE, ISODODECANE, GLYCERIN, PEG-10 DIMETHICONE, MICA, TOCOPHEROL."
    },
    {
        name: "Glitter Face blush",
        price: 6500,
        category: "FACE",
        image: "glitterblush.png",
        rating: 4.3,
        stock: 30,
        description: "Sparkling face blush for a glamorous, glowing complexion. Features micro-glitter highlights.",
        shades: ["Sparkle Peach", "Gold Rose Glow"],
        ingredients: "TALC, MICA, MAGNESIUM STEARATE, SILICA, POLYETHYLENE TEREPHTHALATE, TOCOPHERYL ACETATE."
    },
    {
        name: "Sculpting Touch Cream Contour",
        price: 5400,
        category: "FACE",
        image: "sculpttouch.png",
        rating: 4.8,
        stock: 22,
        description: "Contouring stick with a matte finish. Creamy texture for easy blending and carving features.",
        shades: ["201 Light Brown", "202 Medium Brown", "203 Dark Cocoa"],
        ingredients: "ISONONYL ISONONANOATE, SYNTHETIC WAX, OCTYLDODECANOL, SILICA, KAOLIN."
    },

    // --- SKIN CARE ---
    { 
        name: "Skin Trainer Serum", 
        price: 12000, 
        category: "SKIN CARE", 
        image: "trainer.png", 
        rating: 4.9, 
        stock: 15, 
        description: "Youth-generating face serum that trains the skin to be in shape at all ages. Recharges skin energy.",
        shades: [],
        ingredients: "AQUA (WATER), SODIUM HYALURONATE, NIACINAMIDE, GLYCERIN, PHENOXYETHANOL, ADENOSINE, CITRIC ACID."
    },
    { 
        name: "Anti fatigue face Mask", 
        price: 3500, 
        category: "SKIN CARE", 
        image: "fatigue.png", 
        rating: 4.3, 
        stock: 80, 
        description: "Revitalizing and hydrating sheet mask to combat visual signs of skin fatigue.",
        shades: [],
        ingredients: "AQUA (WATER), BUTYLENE GLYCOL, GLYCERIN, CITRUS GRANDIS SEED EXTRACT, CAFFEINE, HYDROGENATED CASTOR OIL."
    },
    {
        name: "Hydra Pro Day Mask",
        price: 10500,
        category: "SKIN CARE",
        image: "hydrate.png",
        rating: 4.7,
        stock: 20,
        description: "Deeply moisturizing day mask for prolonged hydration. Infused with hyaluronic acid.",
        shades: [],
        ingredients: "AQUA, GLYCERIN, HYDROGENATED POLYDECENE, BUTYROSPERMUM PARKII BUTTER, SODIUM HYALURONATE."
    },
    {
        name: "Black Clay Mask",
        price: 8900,
        category: "SKIN CARE",
        image: "clayMask.png",
        rating: 4.5,
        stock: 28,
        description: "Purifying black clay mask to cleanse and refine pores. Absorbs excess sebum for clear skin.",
        shades: [],
        ingredients: "KAOLIN, BENTONITE, CHARCOAL POWDER, AQUA, GLYCERIN, CITRIC ACID, METHYLPARABEN."
    },
    {
        name: "Intensive Night Youth Serum",
        price: 2900,
        category: "SKIN CARE",
        image: "nightserum.png",
        rating: 4.6,
        stock: 90,
        description: "Overnight intensive serum to rejuvenate and restore youthful skin elasticity and brightness.",
        shades: [],
        ingredients: "AQUA, RETINOL, TOCOPHEROL, SQUALANE, CAPRYLIC/CAPRIC TRIGLYCERIDE, PHENOXYETHANOL."
    },
    {
        name: "Bright Lift Serum",
        price: 3200,
        category: "SKIN CARE",
        image: "liftserum.png",
        rating: 4.7,
        stock: 67,
        description: "Lifting and brightening serum for a radiant, firm complexion. Formulated with marine collagen.",
        shades: [],
        ingredients: "AQUA, NIACINAMIDE, HYDROLYZED COLLAGEN, CAPRYLYL GLYCOL, HYALURONIC ACID, ASCORBIC ACID."
    },

    // --- ACCESSORIES ---
    { 
        name: "Precision Make-up Blender", 
        price: 2500, 
        category: "ACCESSORIES", 
        image: "sponge.png", 
        rating: 4.8, 
        stock: 150, 
        description: "Professional teardrop sponge blender for flawless foundation and concealer application.",
        shades: ["Pink Blossom", "Charcoal Black"],
        ingredients: "100% LATEX-FREE POLYURETHANE FOAM."
    },
    { 
        name: "Face 102 Blush Brush", 
        price: 4200, 
        category: "ACCESSORIES", 
        image: "blushbrush.png", 
        rating: 4.4, 
        stock: 40, 
        description: "Tapered synthetic fiber brush for professional cheek highlighting and blush blending.",
        shades: [],
        ingredients: "SYNTHETIC VEGAN BRISTLES, ANODIZED ALUMINUM FERRULE, MATTE BLACK WOODEN HANDLE."
    },
    {
        name: "Eyes 51 Shader Brush",
        price: 3100,
        category: "ACCESSORIES",
        image: "powderbrush.png",
        rating: 4.5,
        stock: 65,
        description: "Flat brush for applying concealer and eyeshadow. Synthetic bristles pick up pigment perfectly.",
        shades: [],
        ingredients: "SYNTHETIC BRISTLES, MATTE BRASS FERRULE, BAMBOO HANDLE."
    },
    {
        name: "Eyelash Curlur",
        price: 2800,
        category: "ACCESSORIES",
        image: "curler.png",
        rating: 4.7,
        stock: 85,
        description: "Professional eyelash curler. Ergonomic design for custom lash curl styling without pinching.",
        shades: [],
        ingredients: "100% STAINLESS STEEL FRAME, EXTRA SILICONE REPLACEMENT PADS."
    },
    {
        name: "Face powder Sponges Set",
        price: 1800,
        category: "ACCESSORIES",
        image: "powdersponges.png",
        rating: 4.7,
        stock: 85,
        description: "Set of soft sponges for flawless face powder application. Velvet texture blends powder seamlessly.",
        shades: [],
        ingredients: "LATEX-FREE COTTON VELVET FIBERS, POLYURETHANE CORE."
    },
    {
        name: "Mini Manicure Set",
        price: 4800,
        category: "ACCESSORIES",
        image: "manicure.png",
        rating: 4.7,
        stock: 85,
        description: "Travel-friendly mini manicure set for perfect nails on the go. Compact case.",
        shades: [],
        ingredients: "STAINLESS STEEL SCISSORS, NAIL CLIPPER, TWEEZER, GLASS FILE, PU LEATHER CASE."
    },
    {
        name: "Tweezer",
        price: 2000,
        category: "ACCESSORIES",
        image: "tweezer.png",
        rating: 4.7,
        stock: 85,
        description: "High-precision tweezers for flawless brow shaping. Hand-filed slanted tips.",
        shades: [],
        ingredients: "STAINLESS STEEL CASE, MATTE BLACK POWDER COATING."
    },

    // --- HAIR ---
    { 
        name: "Nourishing Hair Oil", 
        price: 4500, 
        category: "HAIR", 
        image: "hairoil.png", 
        rating: 4.8, 
        stock: 40, 
        description: "Restorative hair elixir oil for silky, split-end resistant glossy hair. Features organic argan and macadamia.",
        shades: [],
        ingredients: "CYCLOPENTASILOXANE, DIMETHICONOL, ARGANIA SPINOSA KERNEL OIL, MACADAMIA TERNIFOLIA SEED OIL."
    },
    {
        name: "Volume Hair Spray",
        price: 3200,
        category: "HAIR",
        image: "hairspray.png",
        rating: 4.5,
        stock: 55,
        description: "Lightweight spray for long-lasting volume. Formulated to keep styles in place without stiffness.",
        shades: [],
        ingredients: "ALCOHOL DENAT., ACETONE, AQUA, POLYURETHANE-14, AMP-ACRYLATES COPOLYMER."
    },
    {
        name: "Repairing Hair Mask",
        price: 5100,
        category: "HAIR",
        image: "hairmask.png",
        rating: 4.9,
        stock: 25,
        description: "Intense repair mask for dry, damaged hair. Penetrates deep to rebuild keratin bonds.",
        shades: [],
        ingredients: "AQUA, CETEARYL ALCOHOL, BEHENTRIMONIUM CHLORIDE, COCOS NUCIFERA OIL, PARFUM."
    },
    {
        name: "Hair Nourishing Shampoo",
        price: 5000,
        category: "HAIR",
        image: "shampoo.png",
        rating: 4.6,
        stock: 30,
        description: "Intense repair hair shampoo for damaged hair. Cleanses gently while restoring natural shine.",
        shades: [],
        ingredients: "AQUA, SODIUM LAURETH SULFATE, COCAMIDOPROPYL BETAINE, GLYCOL DISTEARATE."
    },
    {
        name: "Dry hair serum",
        price: 7000,
        category: "HAIR",
        image: "dryserum.png",
        rating: 4.9,
        stock: 49,
        description: "Dry hair serum for healthy and glossy hair. Controls frizz and adds a protective seal.",
        shades: [],
        ingredients: "CYCLOPENTASILOXANE, DIMETHICONE, TOCOPHEROL, SWEET ALMOND OIL."
    },

    // --- FRAGRANCE ---
    { 
        name: "Velvet Passion Perfume", 
        price: 15500, 
        category: "FRAGRANCE", 
        image: "colonne.png", 
        rating: 4.9, 
        stock: 15, 
        description: "Elegant floral Eau De Parfum featuring woody undertones and white musk highlights.",
        shades: [],
        ingredients: "ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), BENZYL SALICYLATE, LIMONENE, LINALOOL."
    },
    { 
        name: "Velvet Passion Eau De Parfum", 
        price: 15500, 
        category: "FRAGRANCE", 
        image: "colonne.png", 
        rating: 4.9, 
        stock: 15, 
        description: "Elegant floral Eau De Parfum featuring woody undertones and white musk highlights.",
        shades: [],
        ingredients: "ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), BENZYL SALICYLATE, LIMONENE, LINALOOL."
    },
    {
        name: "Ocean Breeze Body Mist",
        price: 42200,
        category: "FRAGRANCE",
        image: "purple.png",
        rating: 4.6,
        stock: 60,
        description: "Refreshing daily body mist. Invigorating blend of sea salt, marine jasmine, and white wood.",
        shades: [],
        ingredients: "ALCOHOL DENAT., AQUA (WATER), GLYCERIN, PARFUM (FRAGRANCE), TOCOPHERYL ACETATE."
    },
    {
        name: "Midnight Musk Perfume",
        price: 18000,
        category: "FRAGRANCE",
        image: "red.png",
        rating: 4.8,
        stock: 10,
        description: "Intense, long-lasting evening fragrance. Warm musk accords with jasmine and vanilla infusions.",
        shades: [],
        ingredients: "ALCOHOL DENAT., PARFUM, AQUA, COUMARIN, LINALOOL, HEXYL CINNAMAL."
    },
    {
        name: "Scent of Milan Eau",
        price: 22000,
        category: "FRAGRANCE",
        image: "floralfruity.png",
        rating: 4.9,
        stock: 10,
        description: "Intense, long-lasting evening fragrance with notes of orange blossom and soft amber.",
        shades: [],
        ingredients: "ALCOHOL DENAT., PARFUM (FRAGRANCE), AQUA (WATER), CITRONELLOL, LIMONENE."
    },
    {
        name: "Scent of Milan Eau Barera District",
        price: 18000,
        category: "FRAGRANCE",
        image: "milaneau.png",
        rating: 4.8,
        stock: 55,
        description: "Intense, long-lasting day fragrance highlighting wild rose, violet leaves, and patchouli.",
        shades: [],
        ingredients: "ALCOHOL DENAT., PARFUM, AQUA, GERANIOL, CITRAL, BENZYL ALCOHOL."
    }
];

async function seedDatabase() {
    try {
        const existing = await Product.find();
        console.log(`Loaded ${existing.length} existing products from database.`);

        let updatedCount = 0;
        let insertedCount = 0;

        for (const item of kikoProducts) {
            const match = existing.find(p => p.name.toLowerCase() === item.name.toLowerCase());
            if (match) {
                match.price = item.price;
                match.category = item.category;
                match.image = item.image;
                // rating field is review-driven, do not overwrite it with seed default
                match.stock = item.stock;
                match.description = item.description;
                // Preserve shades/ingredients if they are present
                match.shades = item.shades && item.shades.length > 0 ? item.shades : (match.shades || []);
                match.ingredients = item.ingredients && item.ingredients !== "" ? item.ingredients : (match.ingredients || "");
                await match.save();
                updatedCount++;
            } else {
                const itemData = { ...item };
                delete itemData.rating; // Let Product schema rating default to 0
                const newProd = new Product(itemData);
                await newProd.save();
                insertedCount++;
            }
        }

        // Run sync to update ratings based on real reviews (if any exist)
        const { syncProductRatings } = require('./utils/ratingSync');
        await syncProductRatings();

        console.log(`✅ Update & Restore Complete: ${updatedCount} updated in-place, ${insertedCount} newly inserted. Total: ${kikoProducts.length} products.`);
        return { success: true, updated: updatedCount, inserted: insertedCount };
    } catch (error) {
        console.error('Seeding error:', error);
        throw error;
    }
}

if (require.main === module) {
    seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDatabase };
