-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(36) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `type` ENUM('ebook', 'formation') NOT NULL,
    `coverImage` TEXT NOT NULL,
    `fileStorageKey` TEXT NOT NULL,
    `fileSize` INTEGER NULL,
    `fileMimeType` VARCHAR(191) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_rights` (
    `id` VARCHAR(36) NOT NULL,
    `clerkUserId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(36) NOT NULL,
    `stripeCheckoutSessionId` VARCHAR(191) NOT NULL,
    `amountPaid` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `status` ENUM('ACTIVE', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
    `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `lastDownloadedAt` DATETIME(3) NULL,
    `downloadCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `access_rights_clerkUserId_idx`(`clerkUserId`),
    UNIQUE INDEX `access_rights_clerkUserId_productId_key`(`clerkUserId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(36) NOT NULL,
    `clerkUserId` VARCHAR(191) NOT NULL,
    `stripeCheckoutSessionId` VARCHAR(191) NOT NULL,
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `totalAmount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_stripeCheckoutSessionId_key`(`stripeCheckoutSessionId`),
    INDEX `orders_clerkUserId_idx`(`clerkUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(36) NOT NULL,
    `orderId` VARCHAR(36) NOT NULL,
    `productId` VARCHAR(36) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `pricePaid` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',

    INDEX `order_items_orderId_idx`(`orderId`),
    INDEX `order_items_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `download_links` (
    `id` VARCHAR(36) NOT NULL,
    `clerkUserId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(36) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usedAt` DATETIME(3) NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,

    UNIQUE INDEX `download_links_token_key`(`token`),
    INDEX `download_links_token_idx`(`token`),
    INDEX `download_links_clerkUserId_idx`(`clerkUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `access_rights` ADD CONSTRAINT `access_rights_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `download_links` ADD CONSTRAINT `download_links_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
