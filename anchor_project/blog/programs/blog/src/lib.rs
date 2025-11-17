use anchor_lang::prelude::*;

declare_id!("M4h1dMsA4b25oM7GAR6ycYAhwc3fS9HVQoKh8hS1Une");

#[program]
pub mod blog {
    use super::*;

    pub fn create_blog_entry(
        ctx: Context<CreateEntry>,
        title: String,
        content: String
    ) -> Result<()> {
        require!(title.len() > 0 && title.len() <= 50, BlogError::InvalidTitle);
        require!(content.len() > 0 && content.len() <= 1000, BlogError::InvalidContent);

        msg!("Blog Entry Created");
        msg!("Title: {}", title);
        msg!("Content: {}", content);

        let blog_entry = &mut ctx.accounts.blog_entry;
        let clock = Clock::get()?;
        
        blog_entry.owner = ctx.accounts.owner.key();
        blog_entry.title = title;
        blog_entry.content = content;
        blog_entry.created_at = clock.unix_timestamp;
        blog_entry.updated_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn update_blog_entry(
        ctx: Context<UpdateBlog>,
        _title: String,
        content: String
    ) -> Result<()> {
        require!(content.len() > 0 && content.len() <= 1000, BlogError::InvalidContent);
        
        let blog_entry = &mut ctx.accounts.blog_entry;
        
        // Verify the signer is the owner
        require!(
            blog_entry.owner == ctx.accounts.owner.key(),
            BlogError::Unauthorized
        );

        msg!("Blog entry updated");
        msg!("New Content: {}", content);

        let clock = Clock::get()?;
        blog_entry.content = content;
        blog_entry.updated_at = clock.unix_timestamp;

        Ok(())
    }

    pub fn delete_blog_entry(
        ctx: Context<DeleteBlog>,
        title: String
    ) -> Result<()> {
        let blog_entry = &ctx.accounts.blog_entry;
        
        // Verify the signer is the owner
        require!(
            blog_entry.owner == ctx.accounts.owner.key(),
            BlogError::Unauthorized
        );

        msg!("Blog '{}' deleted successfully", title);
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct BlogEntryState {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub content: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Accounts)]
#[instruction(title: String, content: String)]
pub struct CreateEntry<'info> {
    #[account(
        init,
        seeds = [b"blog", title.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + BlogEntryState::INIT_SPACE
    )]
    pub blog_entry: Account<'info, BlogEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String, content: String)]
pub struct UpdateBlog<'info> {
    #[account(
        mut,
        seeds = [b"blog", title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + BlogEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = false,
    )]
    pub blog_entry: Account<'info, BlogEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteBlog<'info> {
    #[account(
        mut,
        seeds = [b"blog", title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner
    )]
    pub blog_entry: Account<'info, BlogEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[error_code]
pub enum BlogError {
    #[msg("Title must be between 1 and 50 characters")]
    InvalidTitle,
    #[msg("Content must be between 1 and 1000 characters")]
    InvalidContent,
    #[msg("Only the owner can modify or delete this blog entry")]
    Unauthorized,
}