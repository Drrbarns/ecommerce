import { MetadataRoute } from 'next';
import { getProducts, getCollections } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moolre.com';

    // Static pages
    const staticPages: { path: string; changeFreq: 'daily' | 'weekly'; priority: number }[] = [
        { path: '', changeFreq: 'daily', priority: 1 },
        { path: '/shop', changeFreq: 'daily', priority: 0.9 },
        { path: '/collections', changeFreq: 'weekly', priority: 0.8 },
        { path: '/about', changeFreq: 'weekly', priority: 0.5 },
        { path: '/contact', changeFreq: 'weekly', priority: 0.5 },
        { path: '/blog', changeFreq: 'weekly', priority: 0.7 },
        { path: '/tracking', changeFreq: 'weekly', priority: 0.5 },
        { path: '/privacy', changeFreq: 'weekly', priority: 0.3 },
        { path: '/terms', changeFreq: 'weekly', priority: 0.3 },
        { path: '/faq', changeFreq: 'weekly', priority: 0.6 },
        { path: '/shipping', changeFreq: 'weekly', priority: 0.6 },
        { path: '/returns', changeFreq: 'weekly', priority: 0.6 },
        { path: '/careers', changeFreq: 'weekly', priority: 0.4 },
    ];

    const staticEntries: MetadataRoute.Sitemap = staticPages.map(page => ({
        url: `${baseUrl}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
    }));

    // Dynamic product pages
    let productEntries: MetadataRoute.Sitemap = [];
    try {
        const products = await getProducts();
        productEntries = products.map(product => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));
    } catch (error) {
        console.error('Error fetching products for sitemap:', error);
    }

    // Dynamic collection pages
    let collectionEntries: MetadataRoute.Sitemap = [];
    try {
        const collections = await getCollections();
        collectionEntries = collections.map(collection => ({
            url: `${baseUrl}/collections/${collection.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Error fetching collections for sitemap:', error);
    }

    return [...staticEntries, ...productEntries, ...collectionEntries];
}
